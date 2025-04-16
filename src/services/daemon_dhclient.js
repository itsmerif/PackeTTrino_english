async function dhclient_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";
    const terminalPrint = document.querySelector(".terminal-component").dataset.id === networkObjectId;

    if (!isDhclientOn) return;

    if (packet.type === "offer") {

        if (dhcpOfferBuffer[networkObjectId]) return;

        if ($networkObject.getAttribute("ip-enp0s3") !== "") return;

        if (packet.chaddr !== networkObjectMac) return;

        dhcpDiscoverFlag[networkObjectId] = true;

        if (terminalPrint) terminalMessage(`DHCPOFFER of ${packet.yiaddr} from ${packet.siaddr}`);

        dhcpOfferBuffer[networkObjectId] = true;

        let newPacket = new dhcpRequest(
            networkObjectMac, //origin mac
            packet.yiaddr, //requested ip
            packet.siaddr, //server ip
            networkObjectId //hostname
        );

        newPacket.destination_mac = packet.origin_mac;
        newPacket.yiaddr = packet.yiaddr;
        newPacket.giaddr = packet.giaddr;
        newPacket.chaddr = packet.chaddr;

        if (terminalPrint) terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on enp0s3 to ${packet.siaddr} port 67`);

        return newPacket;

    }

    if (packet.type === "ack") {

        if (packet.chaddr !== networkObjectMac) return;

        if (terminalPrint) terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`);

        dhcpRequestFlag[networkObjectId] = true;

        delete dhcpOfferBuffer[networkObjectId];

        setDhcpInfo(networkObjectId, packet);
        
        updateClientLeaseTimer(networkObjectId);
        
        if (terminalPrint) terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`);

    }

}

async function dhcpDiscoverGenerator(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    return;
}

async function dhcpRequestGenerator(networkObjectId, switchId, renewPhase = "T1") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectGateway = $networkObject.getAttribute("data-gateway");
    const networkObjectDns = $networkObject.getAttribute("data-dns-server");

    const networkObjectLeaseTime = $networkObject.getAttribute("data-dhcp-lease-time");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");

    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dhcpServerIp, networkObjectNetmask);

    //construimos el paquete

    let packet = new dhcpRequest(
        networkObjectMac, //origin mac
        "", //requested ip
        dhcpServerIp, //server ip
        networkObjectId //hostname
    );

    packet.origin_ip = networkObjectIp;
    packet.destination_ip = dhcpServerIp;
    packet.ciaddr = networkObjectIp;
    packet.leasetime = networkObjectLeaseTime;
    packet.gateway = networkObjectGateway;
    packet.netmask = networkObjectNetmask;
    packet.dns = networkObjectDns;

    if (renewPhase === "T2") { //en el caso de T2, el paquete se envia directamente por broadcast
        packet.destination_ip = "255.255.255.255";
        packet.destination_mac = "ff:ff:ff:ff:ff:ff";
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;
    }

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = packet;
            await arpResolve(networkObjectId, defaultGateway);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const destination_mac = isIpInARPTable(networkObjectId, dhcpServerIp);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, dhcpServerIp);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}

async function dhcpReleaseGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const neworkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const isDHCPon = $networkObject.getAttribute("dhclient");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    const isSameNetwork = getNetwork(networkObjectIp, neworkObjectNetmask) === getNetwork(dhcpServerIp, neworkObjectNetmask);
    const terminalPrint = document.querySelector(".terminal-component").dataset.id === networkObjectId;

    let packet = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, "");

    if (isDHCPon === "false" || !dhcpServerIp) {
        if (terminalPrint) terminalMessage(networkObjectId + " : No se ha definido el servidor DHCP");
        return;
    }

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = packet;
            await arpResolve(networkObjectId, defaultGateway);
            deleteDhcpInfo(networkObjectId);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        addPacketTraffic(packet);
        deleteDhcpInfo(networkObjectId);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const serverObjectMac = isIpInARPTable(networkObjectId, dhcpServerIp);

    if (!serverObjectMac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, dhcpServerIp);
        deleteDhcpInfo(networkObjectId);
        return;
    }

    packet.destination_mac = serverObjectMac;
    addPacketTraffic(packet);
    deleteDhcpInfo(networkObjectId);
    await switchProcessor(switchId, networkObjectId, packet);

}

async function dhcpDiscoverHandler(networkObjectId, switchObjectId) {


    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    if (networkObjectIp !== "") {
        terminalMessage("Error: Este equipo ya tiene una IP asignada.");
        return;
    };


    terminalMessage(`Listening on LPF/enp0s3/${networkObjectMac}`);
    terminalMessage(`Sending on   LPF/enp0s3/${networkObjectMac}`);
    terminalMessage("Sending on   Socket/fallback");
    terminalMessage(`DHCPDISCOVER on enp0s3 to 255.255.255.255 port 67 interval 6`);

    try {

        dhcpDiscoverFlag = false;
        dhcpRequestFlag = false;

        if (visualToggle) await minimizeTerminal();

        await dhcpDiscoverGenerator(networkObjectId, switchObjectId);

        if (visualToggle) await maximizeTerminal();

        if (dhcpDiscoverFlag === false || dhcpRequestFlag === false) {
            terminalMessage("Error: No se pudo encontrar un servidor DHCP.");
            return;
        }


    } catch (error) {

        terminalMessage("Error: " + error);
        console.log(error);
        return;

    }

}

async function dhcpRenewHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.");
        return;
    }

    if (visualToggle) await minimizeTerminal();

    try {

        await dhcpRequestGenerator(networkObjectId, switchObjectId);
        terminalMessage("IP renovada correctamente.");

    } catch (error) {

        terminalMessage("Error: " + error);

    }

    if (visualToggle) await maximizeTerminal();

}

async function dhcpReleaseHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.");
        return;
    }

    terminalMessage(`Listening on LPF/enp0s3/${networkObjectMac}`);
    terminalMessage(`Sending on   LPF/enp0s3/${networkObjectMac}`);
    terminalMessage("Sending on   Socket/fallback");
    terminalMessage(`DHCPRELEASE of ${networkObjectIp} on enp0s3 to ${networkObjectDhcpServer} port 67`);
    await dhcpReleaseGenerator(networkObjectId, switchObjectId);
    return;
}

async function dhcpDiscoverGenerator(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    return;
}

async function dhcpRequestGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dhcpServerIp, networkObjectNetmask);

    let packet = new dhcpRequest(
        networkObjectMac, //origin mac
        "", //requested ip
        dhcpServerIp, //server ip
        networkObjectId //hostname
    );

    packet.origin_ip = networkObjectIp;
    packet.destination_ip = dhcpServerIp;
    packet.ciaddr = networkObjectIp;


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
    let packet = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, "");

    if (isDHCPon === "false" || !dhcpServerIp) {
        terminalMessage(networkObjectId + " : No se ha definido el servidor DHCP");
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

async function dhclient_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";
    let responsePacket;

    if (!isDhclientOn) return;
    
    if (packet.type === "offer") {

        if (dhcpOfferBuffer[networkObjectId]) return;

        if ($networkObject.getAttribute("ip-enp0s3") !== "") return;

        if (packet.chaddr === networkObjectMac) {

            dhcpDiscoverFlag = true;

            terminalMessage(`DHCPOFFER of ${packet.yiaddr} from ${packet.siaddr}`);

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

            terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on enp0s3 to ${packet.siaddr} port 67`);

            return newPacket;

        }

    }

    if (packet.type === "ack") {

        if (packet.chaddr === networkObjectMac) {
            terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`);
            dhcpRequestFlag = true;
            delete dhcpOfferBuffer[networkObjectId];
            setDhcpInfo(networkObjectId, packet);
            terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`);
        }

    }

}
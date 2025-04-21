async function dhclient_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";

    if (!isDhclientOn) return;

    if (packet.type === "offer") {

        if (dhcpOfferBuffer[networkObjectId]) return;

        if ($networkObject.getAttribute("ip-enp0s3") !== "") return;

        if (packet.chaddr !== networkObjectMac) return;

        dhcpDiscoverFlag[networkObjectId] = true;

        terminalMessage(`DHCPOFFER of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);

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

        terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on enp0s3 to ${packet.siaddr} port 67`, networkObjectId);

        return newPacket;

    }

    if (packet.type === "ack") {
        if (packet.chaddr !== networkObjectMac) return;
        terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);
        dhcpRequestFlag[networkObjectId] = true;
        delete dhcpOfferBuffer[networkObjectId];
        setDhcpInfo(networkObjectId, packet);      
        updateClientLeaseTimer(networkObjectId);      
        terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`, networkObjectId);
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

    if (renewPhase === "T2") {
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

    let packet = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, "");

    if (isDHCPon === "false" || !dhcpServerIp) {
        terminalMessage(networkObjectId + " : No se ha definido el servidor DHCP", networkObjectId);
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

function setDhcpInfo(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const $pcForm = document.querySelector(".pc-form");
    const newIp = packet.yiaddr;
    const newGateway = packet.gateway;
    const newNetmask = packet.netmask;
    const newServer = packet.siaddr;
    const newDns = packet.dns;
    const newLeaseTime = packet.leasetime;

    //actualizamos los atributos del cliente dhcp
    $networkObject.setAttribute("ip-enp0s3", newIp);
    $networkObject.setAttribute("data-gateway", newGateway);
    $networkObject.setAttribute("netmask-enp0s3", newNetmask);
    $networkObject.setAttribute("data-dhcp-server", newServer);
    $networkObject.setAttribute("data-dns-server", newDns);
    $networkObject.setAttribute("data-dhcp-lease-time", newLeaseTime);

    //si tenemos el menu grafico abierto, se actualizan los campos
    if ($pcForm.style.display === "flex" && $pcForm.querySelector("#form-item-id").innerHTML === networkObjectId) {
        $pcForm.querySelector("#ip").value = newIp;
        $pcForm.querySelector("#netmask").value = newNetmask;
        $pcForm.querySelector("#gateway").value = newGateway;
        $pcForm.querySelector("#dns-server").value = newDns;
        $pcForm.querySelector("#renew-btn").style.display = "block";
        $pcForm.querySelector("#release-btn").style.display = "block";
        $pcForm.querySelector("#get-btn").style.display = "none";
    }

}

async function updateClientLeaseTimer(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("data-dhcp-current-lease-time", 0);
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");
    if (clientLeaseTimers[networkObjectId]) return;
    const clientLeaseTimer = setInterval( async () => { await reduceClientLeaseTime(networkObjectId)}, 1000 );
    clientLeaseTimers[networkObjectId] = clientLeaseTimer;
}

async function reduceClientLeaseTime(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const leaseTime = parseInt($networkObject.getAttribute("data-dhcp-lease-time"));
    const flagT1 = $networkObject.getAttribute("data-dhcp-flag-t1");
    const flagT2 = $networkObject.getAttribute("data-dhcp-flag-t2");
    const T1 = leaseTime * 0.5;
    const T2 = leaseTime * 0.875;

    $networkObject.setAttribute("data-dhcp-current-lease-time", parseInt($networkObject.getAttribute("data-dhcp-current-lease-time")) + 1 );
    const currentLeaseTime = parseInt($networkObject.getAttribute("data-dhcp-current-lease-time"));
    
    if (currentLeaseTime > T1 && flagT1 === "false") {
        $networkObject.setAttribute("data-dhcp-flag-t1", "true");
        let renewAttempt = await dhcpRenewHandler(networkObjectId, switchId);
        if (renewAttempt) $networkObject.setAttribute("data-dhcp-flag-t1", "false");
        return;
    }

    if (currentLeaseTime > T2 && flagT2 === "false") {
        $networkObject.setAttribute("data-dhcp-flag-t2", "true");
        let renewAttempt = await dhcpRenewHandler(networkObjectId, switchId, "T2");
        if (renewAttempt) $networkObject.setAttribute("data-dhcp-flag-t2", "false");
        return;
    }

    if (currentLeaseTime >= leaseTime ) {
        clearInterval(clientLeaseTimers[networkObjectId]);
        delete clientLeaseTimers[networkObjectId];
        deleteDhcpInfo(networkObjectId);
        await dhcpDiscoverGenerator(networkObjectId, switchId);
        return;
    }

}

function deleteDhcpInfo(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const $pcForm = document.querySelector(".pc-form");

    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("data-dhcp-current-lease-time", "");
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");
    clearInterval(clientLeaseTimers[networkObjectId]);
    delete clientLeaseTimers[networkObjectId];

    if ($pcForm.style.display === "flex" && $pcForm.querySelector("#form-item-id").innerHTML === networkObjectId) {
        $pcForm.querySelector("#ip").value = "";
        $pcForm.querySelector("#netmask").value = "";
        $pcForm.querySelector("#gateway").value = "";
        $pcForm.querySelector("#dns-server").value = "";
        $pcForm.querySelector("#renew-btn").style.display = "none";
        $pcForm.querySelector("#release-btn").style.display = "none";
        $pcForm.querySelector("#get-btn").style.display = "block";
    }
}
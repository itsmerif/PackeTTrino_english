async function dhcpDiscoverGenerator(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    return;
}

async function dhcpRenewGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dhcpServerIp, networkObjectNetmask);
    let packet = new dhcpRenew(networkObjectIp, dhcpServerIp, networkObjectMac, "", networkObjectId);

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
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const neworkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const isDHCPon = $networkObject.getAttribute("data-dhcp");
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

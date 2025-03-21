async function dhcpDiscoverGenerator(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    return;
}

async function dhcpReleaseGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const neworkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const isDHCPon = $networkObject.getAttribute("data-dhcp");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    let newPacket;

    if (isDHCPon === "false" || !dhcpServerIp) {
        terminalMessage(networkObjectId + " : No se ha definido el servidor DHCP");
        return;
    }

    //enviamos el dhcp release

    if (getNetwork(networkObjectIp, neworkObjectNetmask) !== getNetwork(dhcpServerIp, neworkObjectNetmask)) { //estan en diferentes redes

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        newPacket = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, defaultGatewayMac); //creamos el paquete dirigido a la puerta de enlace

        if (!defaultGatewayMac) { //no tenemos la puerta de enlace en la la tabla ARP
            buffer[networkObjectId] = newPacket;
            let arpRequest = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(arpRequest);
            await switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla ARP

        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        deleteDhcpInfo(networkObjectId);
        return;

    }

    //están en la misma red

    const serverObjectMac = isIpInARPTable(networkObjectId, dhcpServerIp);
    newPacket = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, serverObjectMac);

    if (!serverObjectMac) { //la mac del server no está en la tabla arp
        buffer[networkObjectId] = newPacket;
        let arpRequest = new ArpRequest(networkObjectIp, dhcpServerIp, networkObjectMac);
        addPacketTraffic(arpRequest);
        await switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    //la mac del server está en la tabla arp

    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);
    deleteDhcpInfo(networkObjectId);

}

async function dhcpRenewGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dhcpServerIp, networkObjectNetmask);
    let newPacket;

    if (!isSameNetwork) { //el servidor dhcp no está en la misma red, intentamos llevarlo a la puerta de enlace

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        newPacket = new dhcpRenew(networkObjectIp, dhcpServerIp, networkObjectMac, defaultGatewayMac, networkObjectId);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            buffer[networkObjectId] = newPacket;
            let arpRequest = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(arpRequest);
            await switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;

    }

    //el servidor dhcp está en la misma red, enviamos un DHCP Renew

    const destination_mac = isIpInARPTable(networkObjectId, dhcpServerIp);
    newPacket = new dhcpRenew(networkObjectIp, dhcpServerIp, networkObjectMac, destination_mac, networkObjectId);

    if (!destination_mac) { //la mac del servidor no está en la tabla arp
        buffer[networkObjectId] = newPacket;
        let arpRequest = new ArpRequest(networkObjectIp, dhcpServerIp, networkObjectMac);
        addPacketTraffic(arpRequest);
        await switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    //la mac del servidor está en la tabla arp

    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);

}
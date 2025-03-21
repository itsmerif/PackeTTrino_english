async function dnsRequestPacketGenerator(networkObjectId, switchId, domain, dnsServer = "", query_type = "A") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    if (!dnsServer) dnsServer = $networkObject.getAttribute("data-dns-server"); //si no se especificó el servidor dns, usamos el que tenemos en el objeto
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dnsServer, networkObjectNetmask);
    let packet;

    if (!dnsServer) {
        terminalMessage(networkObjectId + ": No se ha definido el servidor DNS");
        return;
    }

    if (!isSameNetwork) { //el servidor dns no está en la misma red, intentamos llevarlo a la puerta de enlace

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, defaultGatewayMac, domain);
        packet.answer_type = query_type;

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            buffer[networkObjectId] = packet;
            let arpRequest = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(arpRequest);
            await switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    const destination_mac = isIpInARPTable(networkObjectId, dnsServer);
    packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, destination_mac, domain);
    packet.answer_type = query_type;

    if (!destination_mac) { //la mac del servidor no está en la tabla arp
        buffer[networkObjectId] = packet;
        let arpRequest = new ArpRequest(networkObjectIp, dnsServer, networkObjectMac);
        addPacketTraffic(arpRequest);
        await switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
async function dnsRequestPacketGenerator(networkObjectId, switchId, domain, dnsServer = "", query_type = "A") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    let packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, "", domain);
    packet.answer_type = query_type;

    if (!dnsServer) dnsServer = $networkObject.getAttribute("data-dns-server"); //si no se especificó el servidor dns, usamos el que tenemos en el objeto

    if (!dnsServer) {
        terminalMessage(networkObjectId + ": No se ha definido el servidor DNS");
        return;
    }

    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dnsServer, networkObjectNetmask);

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");
        
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) { 
            buffer[networkObjectId] = packet;
            arpResolve(networkObjectId, defaultGateway);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const destination_mac = isIpInARPTable(networkObjectId, dnsServer);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        arpResolve(networkObjectId, dnsServer);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
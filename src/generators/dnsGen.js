async function dnsRequestPacketGenerator(networkObjectId, switchId, domain, dnsServer = "", query_type = "A") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    dnsServer = (dnsServer === "") ? $networkObject.getAttribute("data-dns-server") : dnsServer;
    if (!dnsServer) throw new Error("Error: No se ha definido el servidor DNS");

    let packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, "", domain);
    packet.answer_type = query_type;
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
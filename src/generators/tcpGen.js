async function tcpSynPacketGenerator(networkObjectId, switchId, destination, port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const isSameNetwork = getNetwork(destination, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);
    let packet = new syn(networkObjectIp, destination, networkObjectMac, "", port);
    tcpBuffer[networkObjectId] = packet.sequence_number;

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = packet;
            arpResolver(networkObjectId, defaultGateway);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        arpResolver(networkObjectId, destination);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
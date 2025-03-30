async function customPacketGenerator(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const switchId = $networkObject.getAttribute("data-switch");
    const destination_ip = packet.destination_ip;
    const isSameNetwork = getNetwork(networkObjectIp, $networkObject.getAttribute("data-netmask")) === getNetwork(destination_ip, $networkObject.getAttribute("data-netmask"));

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


    const destination_mac = isIpInARPTable(networkObjectId, destination_ip);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        arpResolver(networkObjectId, destination_ip);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
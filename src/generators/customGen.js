async function customPacketGenerator(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const switchId = $networkObject.getAttribute("data-switch");
    const destination_ip = packet.destination_ip;
    const isSameNetwork = getNetwork(networkObjectIp, $networkObject.getAttribute("data-netmask")) === getNetwork(destination_ip, $networkObject.getAttribute("data-netmask"));
    let destination_mac;

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = packet;
            let newPacket = new ArpRequest(networkObjectIp, defaultGateway, $networkObject.getAttribute("data-mac"));
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        icmpFlag = false;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    packet.destination_mac = isIpInARPTable(networkObjectId, destination_ip);

    if (!packet.destination_mac) {
        buffer[networkObjectId] = packet;
        let newPacket = new ArpRequest(networkObjectIp, destination_ip, $networkObject.getAttribute("data-mac"));
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
    } else {
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}
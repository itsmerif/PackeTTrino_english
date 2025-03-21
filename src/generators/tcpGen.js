async function tcpSynPacketGenerator(networkObjectId, switchId, destination, port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const isSameNetwork = getNetwork(destination, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);
    let packet;

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            terminalMessage(networkObjectId + ": Error: Puerta de Enlace Predetermina No Configurada");
            return;
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = new syn(networkObjectIp, destination, networkObjectMac, defaultGatewayMac, port);
            tcpBuffer[networkObjectId] = buffer[networkObjectId].sequence_number; //almacenamos el número de secuencia para el siguiente paquete
            packet = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp

        packet = new syn(networkObjectIp, destination, networkObjectMac, defaultGatewayMac, port);
        tcpBuffer[networkObjectId] = packet.sequence_number; //almacenamos el número de secuencia para el siguiente paquete
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = new syn(networkObjectIp, destination, networkObjectMac, destination_mac, port);
        tcpBuffer[networkObjectId] = buffer[networkObjectId].sequence_number; //almacenamos el número de secuencia para el siguiente paquete
        packet = new ArpRequest(networkObjectIp, destination, networkObjectMac);
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new syn(networkObjectIp, destination, networkObjectMac, destination_mac, port);
        tcpBuffer[networkObjectId] = packet.sequence_number; //almacenamos el número de secuencia para el siguiente paquete
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}
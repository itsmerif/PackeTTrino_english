async function icmpRequestPacketGenerator(networkObjectId, switchId, ip, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const isSameNetwork = getNetwork(ip, $networkObject.getAttribute("data-netmask")) === getNetwork(destination, $networkObject.getAttribute("data-netmask"));
    let destination_mac; let packet;

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace

        //terminalMessage(networkObjectId + ": Destino En Otra Red...");
        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            //terminalMessage(networkObjectId + ": Error: Puerta de Enlace Predetermina No Configurada");
            throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            //terminalMessage(networkObjectId + ": Gateway No Guardado. Enviando ARP por " + defaultGateway);
            buffer[networkObjectId] = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), "");
            packet = new ArpRequest(ip, defaultGateway, $networkObject.getAttribute("data-mac"));
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        packet = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), defaultGatewayMac);
        icmpFlag = false;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        //guardamos el paquete en el buffer y enviamos una solicitud ARP primero
        buffer[networkObjectId] = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), "");
        packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), destination_mac);
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}

async function icmpReplyPacketGenerator(networkObjectId, switchId, ip, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const isSameNetwork = getNetwork(ip, $networkObject.getAttribute("data-netmask")) === getNetwork(destination, $networkObject.getAttribute("data-netmask"));
    let destination_mac; let packet;

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace

        //terminalMessage(networkObjectId + ": Destino En Otra Red...");
        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            //terminalMessage(networkObjectId + ": Error: Puerta de Enlace Predetermina No Configurada");
            throw new Error("Error: Puerta de Enlace Predetermina No Configurada");
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            //terminalMessage(networkObjectId + ": Gateway No Guardado. Enviando ARP por " + defaultGateway);
            buffer[networkObjectId] = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), "");
            packet = new ArpRequest(ip, defaultGateway, $networkObject.getAttribute("data-mac"));
            arpFlag = false;
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        packet = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), defaultGatewayMac);
        icmpFlag = false;

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), "");
        packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
        arpFlag = false;

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), destination_mac);
        icmpFlag = false;

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}
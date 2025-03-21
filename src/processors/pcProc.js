async function packetProcessor_PC(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    //cortafuegos

    if (!firewallProcessorHost(networkObjectId, packet)) return;

    //procesamiento de paquetes

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const isSameNetwork = getNetwork(packet.destination_ip, $networkObject.getAttribute("data-netmask")) === getNetwork(networkObjectIp, $networkObject.getAttribute("data-netmask"));
    
    if (packet.protocol === "arp" && packet.type === "request") {
        if (packet.destination_ip !== networkObjectIp) return;
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        //terminalMessage(networkObjectId + ": Respuesta ARP recibida");

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Respuesta ARP invalida");
            return;
        }

        arpFlag = true;


        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        //terminalMessage(networkObjectId + ": El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");

        if (buffer[networkObjectId]) {
            buffer[networkObjectId].destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
            addPacketTraffic(buffer[networkObjectId]);
            await switchProcessor(switchId, networkObjectId, buffer[networkObjectId]);
            //if (buffer[networkObjectId].protocol === "dhcp" && buffer[networkObjectId].type === "release") deleteDhcpInfo(networkObjectId);
            delete buffer[networkObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Solicitud ICMP ignorada");
            return;
        }

        //terminalMessage(networkObjectId + ": Enviando ICMP ECHO REPLY");
        await icmpReplyPacketGenerator(networkObjectId, switchId, networkObjectIp, packet.origin_ip);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "time-exceeded") {
        if (packet.destination_ip !== networkObjectIp) return;
        if (trace) {
            traceReturn = true;
            traceBuffer.push(packet.origin_ip);
        }
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) {
            throw new Error("Destino No Coincide");
        }

        icmpFlag = true;

        if (trace){ //estamos en modo traceroute
            traceBuffer.push(packet.origin_ip);
            traceFlag = true; //confirmamos que hemos encontrado el destino
        }

    }

    if (packet.protocol === "dhcp" && packet.type === "offer") {

        if (packet.chaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo

            ////console.log("DHCP Discover");

            dhcpDiscoverFlag = true;

            //terminalMessage("DHCP OFFER Recibido")

            let newPacket = new dhcpRequest(
                networkObjectMac, //origin mac
                packet.yiaddr, //requested ip
                packet.siaddr, //server ip
                networkObjectId //hostname
            );

            newPacket.destination_mac = packet.origin_mac;
            newPacket.yiaddr = packet.yiaddr;
            newPacket.giaddr = packet.giaddr;
            newPacket.chaddr = packet.chaddr;

            addPacketTraffic(newPacket);
            //terminalMessage("DHCP REQUEST Enviado")
            await switchProcessor(switchId, networkObjectId, newPacket);

        }

    }

    if (packet.protocol === "dhcp" && packet.type === "ack") {
        if (packet.chaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo
            //terminalMessage("DHCP ACK Recibido");
            dhcpRequestFlag = true;
            setDhcpInfo(networkObjectId, packet);
        }
    }

    if (packet.protocol === "dns" && packet.type === "reply") {
        dnsRequestFlag = true;
        buffer[networkObjectId] = packet;
    }

    if (packet.protocol === "tcp" && packet.type === "syn") {
        if (packet.destination_ip !== networkObjectIp) return;
        let newPacket = new synAck(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.sport);
        newPacket.ack_number = packet.sequence_number + 1; //el ack debe ser el siguiente número de secuencia
        tcpBuffer[networkObjectId] = newPacket.sequence_number;
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return; //comprobamos si el paquete es para mi respecto a la secuencia TCP
        let newPacket = new Ack(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.sport);
        newPacket.ack_number = packet.sequence_number + 1; //el ack debe ser el siguiente número de secuencia
        newPacket.sequence_number = packet.ack_number - 1; //el paquete debe tener la secuencia correcta
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack-reply") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return; //comprobamos si el paquete es para mi respecto a la secuencia TCP
        tcpSyncFlag = true;
        return;
    }

    if (packet.protocol === "http" && packet.type === "request") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if ($networkObject.getAttribute("web-server") === "off") return; //comprobamos si el servidor web esta encendido
        //generamos el paquete
        let newPacket = new httpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        newPacket.body = $networkObject.getAttribute("web-content");
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "http" && packet.type === "reply") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        browserBuffer[networkObjectId] = packet;
        return;
    }
}
async function packetProcessor_PC(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    if (!firewallProcessorHost(networkObjectId, packet)) return;

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    
    if (packet.protocol === "arp" && packet.type === "request") {
        if (packet.destination_ip !== networkObjectIp) return;
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) return;

        arpFlag = true;

        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);

        let bufferPacket = buffer[networkObjectId];
        
        if (bufferPacket) {
            bufferPacket.destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
            delete buffer[networkObjectId];
            addPacketTraffic(bufferPacket);
            await switchProcessor(switchId, networkObjectId, bufferPacket);
        }

        return;

    }

    if (packet.protocol === "icmp" && packet.type === "request") {
        if (packet.destination_ip !== networkObjectIp) return;
        let newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
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
        if (packet.destination_ip !== networkObjectIp) return;
        icmpFlag = true;
        if (trace){ //estamos en modo traceroute
            traceBuffer.push(packet.origin_ip);
            traceFlag = true; //confirmamos que hemos encontrado el destino
        }
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
        if (packet.destination_ip !== networkObjectIp) return;
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return;
        tcpSyncFlag = true;
        return;
    }

    if (packet.protocol === "http" && packet.type === "reply") {
        if (packet.destination_ip !== networkObjectIp) return;
        browserBuffer[networkObjectId] = packet;
        return;
    }

    if (packet.protocol === "dhcp") dhclient_service(networkObjectId, packet);

    if (packet.protocol === "dns") resolved_service(networkObjectId, packet);

    if (packet.protocol === "http" && packet.type === "request") apache_service(networkObjectId, packet);
}
async function kernelProcessor(networkObjectId, packet, inputInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableIps = getAvailableIps(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${inputInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${inputInterface}`);
    
    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) return;

        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        const newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        return newPacket;

    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) return;

        arpFlag[networkObjectId] = true;
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        buffer[networkObjectId] = packet;

    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (!availableIps.includes(packet.destination_ip)) return;

        const newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);

        return newPacket;

    }

    if (packet.protocol === "icmp" && packet.type === "time-exceeded") {

        if (!availableIps.includes(packet.destination_ip)) return;

        if (trace[networkObjectId] === true) {
            traceReturn[networkObjectId] = true;
            traceBuffer[networkObjectId].push(packet.origin_ip);
        }

        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {

        if (!availableIps.includes(packet.destination_ip)) return;

        icmpFlag[networkObjectId] = true;

        if (trace[networkObjectId] === true) {
            traceBuffer[networkObjectId].push(packet.origin_ip);
            traceFlag[networkObjectId] = true;
        }

        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn") {

        if (!availableIps.includes(packet.destination_ip)) return;

        let newPacket = new synAck(
            networkObjectIp, //ip del origen
            packet.origin_ip, //ip del destino
            networkObjectMac, //mac del origen
            packet.origin_mac, //mac del destino
            packet.dport, //puerto del origen
            packet.sport //puerto del destino
        );

        newPacket.ack_number = packet.sequence_number + 1; // <--- el ack debe ser el siguiente número de secuencia

        tcpBuffer[networkObjectId] = newPacket.sequence_number;

        return newPacket;

    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack") {

        if (!availableIps.includes(packet.destination_ip)) return;

        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return;

        let newPacket = new Ack(
            networkObjectIp, //ip del origen
            packet.origin_ip, //ip del destino
            networkObjectMac, //mac del origen
            packet.origin_mac, //mac del destino
            packet.dport, //puerto del origen
            packet.sport //puerto del destino
        );

        newPacket.ack_number = packet.sequence_number + 1; // <--- el ack debe ser el siguiente número de secuencia
        newPacket.sequence_number = packet.ack_number - 1; //<--- el paquete debe tener la secuencia correcta

        tcpSyncFlag[networkObjectId] = true;

        return newPacket;

    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack-reply") {
        if (!availableIps.includes(packet.destination_ip)) return;
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return;
        return;
    }

    if (packet.protocol === "http" && packet.type === "reply") {
        if (!availableIps.includes(packet.destination_ip)) return;
        httpBuffer[networkObjectId] = packet;
        return;
    }

    if (packet.protocol === "dns" && packet.type === "reply") {
        if (!availableIps.includes(packet.destination_ip)) return;
        dnsRequestFlag[networkObjectId] = true;
        buffer[networkObjectId] = packet;
        return;
    }

}
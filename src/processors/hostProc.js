async function packetProcessor_Host(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    if (!firewallProcessor(networkObjectId, packet)) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const activeServices = getactiveServices(networkObjectId);
    
    if (packet.protocol === "arp" && packet.type === "request") {
        if (packet.destination_ip !== networkObjectIp) return;
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        await hostRouting(networkObjectId, newPacket)
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {
        if (packet.destination_ip !== networkObjectIp) return;
        arpFlag[networkObjectId] = true;
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        buffer[networkObjectId] = packet;
    }

    if (packet.protocol === "icmp" && packet.type === "request") {      
        if (packet.destination_ip !== networkObjectIp) return
        let newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        await hostRouting(networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "icmp" && packet.type === "time-exceeded") {

        if (packet.destination_ip !== networkObjectIp) return;
        
        if (trace[networkObjectId] === true) {
            traceReturn[networkObjectId] = true;
            traceBuffer[networkObjectId].push(packet.origin_ip);
        }

        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) return;

        icmpFlag[networkObjectId] = true;

        if (trace[networkObjectId] === true){
            traceBuffer[networkObjectId].push(packet.origin_ip);
            traceFlag[networkObjectId] = true;
        }

        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn") {
        if (packet.destination_ip !== networkObjectIp) return;      
        let newPacket = new synAck(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.sport);
        newPacket.ack_number = packet.sequence_number + 1; //el ack debe ser el siguiente número de secuencia
        tcpBuffer[networkObjectId] = newPacket.sequence_number;
        await hostRouting(networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return; //comprobamos si el paquete es para mi respecto a la secuencia TCP
        let newPacket = new Ack(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.sport);
        newPacket.ack_number = packet.sequence_number + 1; //el ack debe ser el siguiente número de secuencia
        newPacket.sequence_number = packet.ack_number - 1; //el paquete debe tener la secuencia correcta
        await hostRouting(networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack-reply") {
        if (packet.destination_ip !== networkObjectIp) return;
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return;
        tcpSyncFlag[networkObjectId] = true;
        return;
    }

    if (packet.protocol === "http" && packet.type === "reply") {
        if (packet.destination_ip !== networkObjectIp) return;
        browserBuffer[networkObjectId] = packet;
        return;
    }

    if (packet.protocol === "dns" && packet.type === "reply") {
        if (packet.destination_ip !== networkObjectIp) return;      
        dnsRequestFlag[networkObjectId] = true;
        buffer[networkObjectId] = packet;
        return;
    }

    if (packet.protocol === "dhcp") {

        if (activeServices.includes("dhclient")) {
            let replyPacket = await dhclient_service(networkObjectId, packet);
            if (replyPacket) await hostRouting(networkObjectId, replyPacket);
        }

        if (activeServices.includes("dhcpd")) {
            let replyPacket = await dhcpd_service(networkObjectId, packet);
            if (replyPacket) await hostRouting(networkObjectId, replyPacket);
        }

        if (activeServices.includes("dhcrelay"))  {
            let replyPacket = await dhcrelay_service(networkObjectId, packet);
            if (replyPacket) await hostRouting(networkObjectId, replyPacket);
        }

    }

    if (packet.protocol === "dns" && packet.type === "request" && activeServices.includes("named") ) {
        let replyPacket = await named_service(networkObjectId, packet);
        if (!replyPacket) return;
        await hostRouting(networkObjectId, replyPacket);
    }

    if (packet.protocol === "http" && packet.type === "request" && activeServices.includes("apache")) {
        let replyPacket = await apache_service(networkObjectId, packet);
        if (!replyPacket) return;
        await hostRouting(networkObjectId, replyPacket);
    }
}
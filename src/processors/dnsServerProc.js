async function packetProcessor_dns_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");

    //comportamiento como equipo normal

    if (packet.protocol === "arp" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp) return;
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) return;
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        if (buffer[serverObjectId]) {
            buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
            addPacketTraffic(buffer[serverObjectId]);
            await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
            delete buffer[serverObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp || packet.destination_mac !== serverObjectMac) return;
        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp || packet.destination_mac !== serverObjectMac) return;
        icmpFlag = true;
    }

    //comportamiento como servidor dns

    if (packet.protocol === "dns" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp) return;
        let answerTranslation = isDomainInCache(serverObjectId, packet.query)[1];
        let newPacket = new dnsReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac, packet.query, answerTranslation);
        newPacket.answer_type = packet.answer_type;
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

}
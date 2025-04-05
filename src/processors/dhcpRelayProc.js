async function packetProcessor_dhcp_relay_server(switchId, agentObjectId, packet) {

    if (visualToggle) await visualize(switchId, agentObjectId, packet);

    if (!firewallProcessorHost(agentObjectId, packet)) return;

    const $agentObject = document.getElementById(agentObjectId);
    const agentObjectMac = $agentObject.getAttribute("data-mac");
    const agentObjectIp = $agentObject.getAttribute("data-ip");

    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== agentObjectIp) return;

        addARPEntry(agentObjectId, packet.origin_ip, packet.origin_mac);

        let newPacket = new ArpReply(agentObjectIp, packet.origin_ip, agentObjectMac, packet.origin_mac);

        addPacketTraffic(newPacket);
        await switchProcessor(switchId, agentObjectId, newPacket);

        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        if (packet.destination_ip !== agentObjectIp) return;

        addARPEntry(agentObjectId, packet.origin_ip, packet.origin_mac);

        let bufferPacket = buffer[agentObjectId];

        if (bufferPacket) {
            bufferPacket.destination_mac = isIpInARPTable(agentObjectId, packet.origin_ip);
            delete buffer[agentObjectId];
            addPacketTraffic(bufferPacket);
            await switchProcessor(switchId, agentObjectId, bufferPacket);
        }

        return;
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== agentObjectIp) return;

        let newPacket = new IcmpEchoReply(agentObjectIp, packet.origin_ip, agentObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, agentObjectId, newPacket);

        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== agentObjectIp) return;
        icmpFlag = true;
        return;
    }

    if (packet.protocol === "dhcp") dhcrelay_service(agentObjectId, packet);

}
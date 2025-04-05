async function packetProcessor_dhcp_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    if (!firewallProcessorHost(serverObjectId, packet)) return;

 
    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const serverObjectNetmask = $serverObject.getAttribute("data-netmask");

    if (!serverObjectIp || !serverObjectNetmask) return;

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

        let bufferPacket = buffer[serverObjectId];

        if (bufferPacket) {
            bufferPacket.destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
            if (bufferPacket.protocol === "dhcp" && bufferPacket.type === "release") deleteDhcpInfo(serverObjectId);
            delete buffer[serverObjectId];
            addPacketTraffic(bufferPacket);
            await switchProcessor(switchId, serverObjectId, bufferPacket);
        }

        return;
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== serverObjectIp) return;

        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) return;
        icmpFlag = true;
    }

    if (packet.protocol === "dhcp") daemon_dhcpd(serverObjectId, packet);

}
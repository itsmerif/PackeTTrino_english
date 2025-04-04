async function packetProcessor_dhcp_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const serverObjectNetmask = $serverObject.getAttribute("data-netmask");
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);
    const defaultGateway = $serverObject.getAttribute("data-gateway");
    const gatewayOffer = $serverObject.getAttribute("offer-gateway");
    const netmaskOffer = $serverObject.getAttribute("offer-netmask");
    const dnsOffer = $serverObject.getAttribute("offer-dns");
    const networkOffer = getNetwork(gatewayOffer, netmaskOffer);

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

        if (packet.destination_ip !== serverObjectIp) {
            return;
        }

        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) {
            throw new Error("Destino No Coincide");
        }
        icmpFlag = true;
    }

    if (packet.protocol === "dhcp" && packet.type === "discover") {

        let offerIP = getRandomIpfromDhcp(serverObjectId)

        let newPacket = new dhcpOffer(
            serverObjectIp,
            serverObjectMac,
            serverObjectIp,
            offerIP,
            packet.origin_mac,
            packet.chaddr,
            gatewayOffer,
            netmaskOffer,
            dnsOffer
        );

        if (packet.giaddr !== "0.0.0.0") {

            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;

        } else {

            if (networkOffer !== serverObjectNetwork) return;
        }

        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "dhcp" && packet.type === "request") {

        if (packet.siaddr !== serverObjectIp) return;

        let newPacket = new dhcpAck(
            serverObjectMac,
            packet.yiaddr,
            serverObjectIp,
            gatewayOffer,
            netmaskOffer,
            dnsOffer,
            packet.hostname
        );

        newPacket.chaddr = packet.chaddr;
        newPacket.destination_mac = packet.origin_mac;

        if (packet.giaddr !== "0.0.0.0") {
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
            newPacket.destination_mac = isIpInARPTable(serverObjectId, defaultGateway); //no basta con esto!!!!
        }

        addDhcpEntry(serverObjectId, packet.yiaddr, packet.chaddr, packet.hostname);
        addPacketTraffic(newPacket)
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "dhcp" && packet.type === "release") {

        if (packet.siaddr !== serverObjectIp) return;

        terminalMessage(serverObjectId + ": Eliminando DHCP entry");
        deleteDhcpEntry(serverObjectId, packet.ciaddr);
        return;

    }

    if (packet.protocol === "dhcp" && packet.type === "renew") {

        if (packet.siaddr !== serverObjectIp) return;

        updateDhcpEntry(serverObjectId, packet.ciaddr);

        let newPacket = new dhcpAck(
            serverObjectMac,
            packet.ciaddr,
            serverObjectIp,
            defaultGateway,
            networkOffer,
            dnsOffer,
            packet.hostname
        );

        newPacket.destination_ip = packet.origin_ip;
        newPacket.destination_mac = packet.origin_mac;
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }
}
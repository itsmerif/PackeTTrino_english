async function packetProcessor_dhcp_server(switchId, serverObjectId, packet) {
    
    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    //cortafuegos

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const serverObjectNetmask = $serverObject.getAttribute("data-netmask");
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);
    const defaultGateway = $serverObject.getAttribute("data-gateway");

    //configuracion del servidor dhcp

    const gatewayOffer = $serverObject.getAttribute("offer-gateway");
    const netmaskOffer = $serverObject.getAttribute("offer-netmask");
    const dnsOffer = $serverObject.getAttribute("offer-dns");
    const networkOffer = getNetwork(gatewayOffer, netmaskOffer); //obtengo la red a la que ofrece

    //comportamiento de pc

    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== serverObjectIp) {
            return;
        }

        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "arp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) {
            return;
        }
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        if (buffer[serverObjectId]) {
            buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
            addPacketTraffic(buffer[serverObjectId]);
            await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
            if (buffer[serverObjectId].protocol === "dhcp" && buffer[serverObjectId].type === "release") deleteDhcpInfo(serverObjectId);
            delete buffer[serverObjectId];
        }
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

    //comportamiento de servidor dhcp

    if (packet.protocol === "dhcp" && packet.type === "discover") { //peticion de descubrimiento dhcp

        let offerIP = getRandomIpfromDhcp(serverObjectId) //obtenemos una ip válida del servidor

        let newPacket = new dhcpOffer(
            serverObjectIp, //origin ip
            serverObjectMac, //origin mac
            serverObjectIp, //server ip
            offerIP, //offer ip
            packet.origin_mac, //destination mac, en los nuevos protocolos de dhcp va directamente a la mac del cliente que solicita
            packet.chaddr, //chaddr
            gatewayOffer, //gateway offer
            netmaskOffer, //netmask offer
            dnsOffer //dns offer
        );

        //comprobamos si proviene de un agente de retransmision

        if (packet.giaddr !== "0.0.0.0") {
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
        } else { //asumimos que el paquete viene de la misma red que el server
            if (networkOffer !== serverObjectNetwork) {
                return;
            }
        }

        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "dhcp" && packet.type === "request") { //solicitud de ip

        if (packet.siaddr === serverObjectIp) { //el paquete va dirigido al server, lo aceptamos

            let newPacket = new dhcpAck(
                serverObjectMac, //origin mac
                packet.yiaddr, //assigned ip
                serverObjectIp, //server ip
                gatewayOffer, //gateway offer
                netmaskOffer, //netmask offer
                dnsOffer, //dns offer
                packet.hostname //hostname
            );

            newPacket.chaddr = packet.chaddr;
            newPacket.destination_mac = packet.origin_mac; //en los nuevos protocolos de dhcp va directamente a la mac del cliente que solicita

            //comprobamos si proviene de un agente de retransmision

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

    }

    if (packet.protocol === "dhcp" && packet.type === "release") {
        if (packet.siaddr === serverObjectIp) { //el paquete va dirigido al server, lo aceptamos
            terminalMessage(serverObjectId + ": Eliminando DHCP entry");
            deleteDhcpEntry(serverObjectId, packet.ciaddr);
            return;
        }
    }

    if (packet.protocol === "dhcp" && packet.type === "renew") {

        if (packet.siaddr === serverObjectIp) { //el paquete va dirigido al server, lo aceptamos

            updateDhcpEntry(serverObjectId, packet.ciaddr);

            let newPacket = new dhcpAck(
                serverObjectMac, //origin mac
                packet.ciaddr, //assigned ip
                serverObjectIp, //server ip
                defaultGateway, //gateway offer
                networkOffer, //netmask offer
                dnsOffer, //dns offer
                packet.hostname //hostname
            );

            newPacket.destination_ip = packet.origin_ip;
            newPacket.destination_mac = packet.origin_mac; //en los nuevos protocolos de dhcp va directamente a la mac del cliente que solicita
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;

        }
    }
}
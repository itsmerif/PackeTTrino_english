async function packetProcessor_dhcp_relay_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    //cortafuegos

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const mainServer = $serverObject.getAttribute("data-main-server");
    const defaultGateway = $serverObject.getAttribute("data-gateway");

    if (packet.destination_ip === serverObjectIp) { //el paquete es para mi

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
                throw new Error("Destino No Coincide");
            }

            addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);

            if (buffer[serverObjectId]) {
                buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
                addPacketTraffic(buffer[serverObjectId]);
                await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
                delete buffer[serverObjectId];
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
            return;
        }

        //comportamiento de servidor dhcp

        if (packet.protocol === "dhcp" && packet.type === "offer") { //oferta del server principal
            if (packet.giaddr !== serverObjectIp) return; //comprobamos si el offer está dirigido al agente
            //reenviamos el paquete al cliente que lo solicitó
            packet.destination_mac = packet.ciaddr;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = serverObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            await switchProcessor(switchId, serverObjectId, packet);
            return;
        }

        if (packet.protocol === "dhcp" && packet.type === "ack") {
            if (packet.giaddr === serverObjectMac) return; //comprobamos si el ack está dirigido al agente
            //cambiamos los campos del paquete
            packet.origin_ip = serverObjectIp;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = serverObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            await switchProcessor(switchId, serverObjectId, packet);
            return;
        }

    }

    if (packet.protocol === "dhcp" && packet.type === "discover") { //peticion de descubrimiento dhcp, la mandamos al server

        let defaultGatewayMac = isIpInARPTable(serverObjectId, defaultGateway);

        //hago cambios en el paquete para que se envie al servidor

        packet.chaddr = packet.origin_mac;
        packet.destination_ip = mainServer;
        packet.origin_mac = serverObjectMac;
        packet.giaddr = serverObjectIp;
        packet.destination_mac = defaultGatewayMac;
        packet.origin_ip = serverObjectIp;

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            buffer[serverObjectId] = packet;
            let newPacket = new ArpRequest(serverObjectIp, defaultGateway, serverObjectMac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;
        }

        //la mac de la puerta de enlace esta en la tabla de arp

        addPacketTraffic(packet);
        await switchProcessor(switchId, serverObjectId, packet);
        return;

    }

    if (packet.protocol === "dhcp" && packet.type === "request") {
        if (packet.giaddr !== serverObjectIp) return; //comprobamos si el request está dirigido al agente
        //cambiamos los campos del paquete
        packet.origin_ip = serverObjectIp;
        packet.destination_ip = mainServer;
        packet.origin_mac = serverObjectMac;
        packet.destination_mac = isIpInARPTable(serverObjectId, defaultGateway);
        addPacketTraffic(packet);
        await switchProcessor(switchId, serverObjectId, packet);
        return;
    }

}
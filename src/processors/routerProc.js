async function packetProcessor_router(switchId, routerObjectId, packet) {

    if (visualToggle) await visualize(switchId, routerObjectId, packet);
    
    const [routerObjectIp, routerObjectNetmask, routerObjectMac] = getInterfaceSwitchInfo(routerObjectId, switchId);
    const interface = switchToInterface(routerObjectId, switchId);
    const availableIps = getAvailableIps(routerObjectId);
    const activeServices = getactiveServices(routerObjectId);

    if (!routerObjectIp || !routerObjectNetmask || !routerObjectMac) return; 

    if (packet.ttl) {

        packet.ttl--;

        if (packet.ttl < 1) {
            packet = new IcmpTimeExceeded(routerObjectIp, packet.origin_ip, routerObjectMac, routerObjectMac);
        }

    }

    if (availableIps.includes(packet.destination_ip) || packet.destination_ip === "255.255.255.255") {

        //filtramos el paquete por la tabla filter

        if (!firewallProcessorFilter(routerObjectId, packet, "INPUT", interface, "")) {
            if (visualToggle) igniteFire(routerObjectId);
            return;
        }

        //miramos si existe una conexion entre el origen y el destino, y deshacemos el SNAT

        if (Object.hasOwn(connTrack, routerObjectId) && connTrack[routerObjectId][packet.origin_ip]) {
            packet.destination_ip = connTrack[routerObjectId][packet.origin_ip];
            delete connTrack[routerObjectId][packet.origin_ip];
            await routing(routerObjectId, packet);
            return;
        }
    
        let replyPacket;

        if (packet.protocol === "arp" && packet.type === "request") {
            if (packet.destination_ip !== routerObjectIp) return;
            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);
            replyPacket = new ArpReply(routerObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
        }

        if (packet.protocol === "icmp" && packet.type === "request") {
            if (!availableIps.includes(packet.destination_ip)) return;
            replyPacket = new IcmpEchoReply(routerObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
        }

        if (packet.protocol === "arp" && packet.type === "reply") {
            if (packet.destination_ip !== routerObjectIp) return;
            arpFlag[routerObjectId] = true;
            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);
            buffer[routerObjectId] = packet;
        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            if (!availableIps.includes(packet.destination_ip)) return;
            icmpFlag[routerObjectId] = true;
            return;
        }

        if (packet.protocol === "dns" && packet.type === "request" && activeServices.includes("named")) {
            if (!availableIps.includes(packet.destination_ip)) return;
            replyPacket = await named_service(routerObjectId, packet);
        }

        if (packet.protocol === "dhcp") {

            if (activeServices.includes("dhcpd")) {

                replyPacket = await dhcpd_service(routerObjectId, packet);

                if (!replyPacket) return;

                if (replyPacket.destination_ip !== "255.255.255.255") {
                    await routing(routerObjectId, replyPacket);
                } else {
                    switchProcessor(switchId, routerObjectId, replyPacket);
                }

                return;
            }

            if (activeServices.includes("dhcrelay"))  {

                replyPacket = await dhcrelay_service(routerObjectId, packet);

                if (!replyPacket) return;

                if (replyPacket.type === "discover" || replyPacket.type === "request") await routing(routerObjectId, replyPacket);

                if (replyPacket.type === "offer" || replyPacket.type === "ack") { //como debe ir por broadcast se lanza directamente a la red
                    let switchOut = getInfoFromIp(routerObjectId, replyPacket.giaddr)[1];
                    if (!switchOut) return;
                    await switchProcessor(switchOut, routerObjectId, replyPacket);
                }

                return;
            }

        }

        if (!replyPacket) return;
        await routing(routerObjectId, replyPacket);
        return;

    }

    await routing(routerObjectId, packet);

}

async function routing(routerObjectId, packet) {

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") return; // <-- no enrutamos broadcast

    const $routerObject = document.getElementById(routerObjectId);
    const availableIps = getAvailableIps(routerObjectId);
    const $routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");

    for (let i = 1; i < $rows.length; i++) {

        let $row = $rows[i];
        let $cells = $row.querySelectorAll("td");
        let ruleNetwork = $cells[0].innerHTML;
        let ruleNetmask = $cells[1].innerHTML;
        let ruleInterface = $cells[3].innerHTML;
        let rulenexthop = $cells[4].innerHTML;

        if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) {

            const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface);
            packet.origin_mac = $routerObject.getAttribute("mac-" + ruleInterface);
            packet.destination_mac = "";
            let nexthopMac;

            if (rulenexthop === "0.0.0.0") {
                nexthopMac = isIpInARPTable(routerObjectId, packet.destination_ip) || await arpResolve(routerObjectId, packet.destination_ip, ruleInterface);
            }else {
                nexthopMac = isIpInARPTable(routerObjectId, rulenexthop) || await arpResolve(routerObjectId, rulenexthop, ruleInterface);
            }

            if (!nexthopMac) return;

            packet.destination_mac = nexthopMac;

            //filtramos el paquete por la tabla filter

            if (availableIps.includes(packet.origin_ip)) {

                if (!firewallProcessorFilter(routerObjectId, packet, "OUTPUT", "", ruleInterface)) {
                    if (visualToggle) igniteFire(routerObjectId);
                    return;
                }

            } else {

                if (!firewallProcessorFilter(routerObjectId, packet, "FORWARD", "", ruleInterface)) {
                    if (visualToggle) igniteFire(routerObjectId);
                    return;
                }

            }

            //guardamos la conexion en el connTrack y hacemos NAT

            if (!connTrack[routerObjectId]) connTrack[routerObjectId] = {};
            connTrack[routerObjectId][packet.destination_ip] = packet.origin_ip;
            packet = firewallProcessorNat(routerObjectId, packet, ruleInterface, "POSTROUTING");

            //enviamos el paquete

            addPacketTraffic(packet);
            await switchProcessor(nextSwitch, routerObjectId, packet);
            return;
        }

    }

}
async function packetProcessor_router(switchId, routerObjectId, packet) {

    if (visualToggle) await visualize(switchId, routerObjectId, packet);

    if (!firewallProcessorRouter(routerObjectId, packet)) return;

    const [routerObjectIp, routerObjectNetmask, routerObjectMac] = getInterfaceInfo(routerObjectId, switchId);
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

        let replyPacket;

        if (packet.protocol === "arp" && packet.type === "request") {
            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);
            replyPacket = new ArpReply(routerObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
        }

        if (packet.protocol === "icmp" && packet.type === "request") {
            replyPacket = new IcmpEchoReply(routerObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
        }

        if (packet.protocol === "arp" && packet.type === "reply") {

            arpFlag = true;
            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);
            let bufferPacket = buffer[routerObjectId];

            if (bufferPacket) {
                bufferPacket.destination_mac = isIpInARPTable(routerObjectId, packet.origin_ip);
                delete buffer[routerObjectId];
                replyPacket = bufferPacket;
            }

        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            icmpFlag = true;
            return;
        }

        if (packet.protocol === "dns" && packet.type === "request" && activeServices.includes("named")) {
            replyPacket = await named_service(routerObjectId, packet);
        }

        if (packet.protocol === "dhcp") {

            if (activeServices.includes("dhcpd")) {
                replyPacket = await dhcpd_service(routerObjectId, packet);
                if (!replyPacket) return;
                if (replyPacket.destination_ip !== "255.255.255.255") await routing(routerObjectId, replyPacket);
                else switchProcessor(switchId, routerObjectId, replyPacket);
                return;
            }

            if (activeServices.includes("dhcrelay"))  {

                replyPacket = await dhcrelay_service(routerObjectId, packet);

                if (!replyPacket) return;

                if (replyPacket.type === "discover") await routing(routerObjectId, replyPacket);
                
                if (replyPacket.type === "request") await routing(routerObjectId, replyPacket);

                if (replyPacket.type === "offer" || replyPacket.type === "ack") {
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

    if (packet.destination_ip === "255.255.255.255") return; //no enrutamos broadcast

    const $routerObject = document.getElementById(routerObjectId);
    const $routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");

    for (let i = 1; i <= $rows.length; i++) {

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
            let nexthopMac = (rulenexthop === "0.0.0.0") ? isIpInARPTable(routerObjectId, packet.destination_ip) : isIpInARPTable(routerObjectId, rulenexthop);

            if (!nexthopMac) {

                buffer[routerObjectId] = packet;

                if (rulenexthop === "0.0.0.0") await arpResolve(routerObjectId, packet.destination_ip, ruleInterface);
                else await arpResolve(routerObjectId, rulenexthop, ruleInterface);

                return;
            }

            packet.destination_mac = nexthopMac;
            addPacketTraffic(packet);
            await switchProcessor(nextSwitch, routerObjectId, packet);
            return;
        }

    }

}
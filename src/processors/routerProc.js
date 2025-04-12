async function packetProcessor_router(switchId, routerObjectId, packet) {

    if (visualToggle) await visualize(switchId, routerObjectId, packet);

    if (!firewallProcessorRouter(routerObjectId, packet)) return;

    if (packet.destination_ip === "255.255.255.255") return; //TODO: chequear servicios primero

    const [routerObjectIp, routerObjectNetmask, routerObjectMac] = getInterfaceInfo(routerObjectId, switchId);
    if (!routerObjectIp || !routerObjectNetmask || !routerObjectMac) return;
    const isSameNetwork = getNetwork(packet.destination_ip, routerObjectNetmask) === getNetwork(routerObjectIp, routerObjectNetmask);
    const availableIps = getAvailableIps(routerObjectId);

    if (packet.ttl && !availableIps.includes(packet.origin_ip)) {
        packet.ttl--;
        if (packet.ttl < 1) {
            packet = new IcmpTimeExceeded(routerObjectIp, packet.origin_ip, routerObjectMac, routerObjectMac);
        }
    }

    if (availableIps.includes(packet.destination_ip)) {

        if (packet.protocol === "arp" && packet.type === "request") {
            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);
            let newPacket = new ArpReply(routerObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, routerObjectId, newPacket);
            return;
        }

        if (packet.protocol === "icmp" && packet.type === "request") {
            let newPacket = new IcmpEchoReply(routerObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, routerObjectId, newPacket);
            return;
        }

        if (packet.protocol === "arp" && packet.type === "reply") {

            arpFlag = true;

            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);

            let bufferPacket = buffer[routerObjectId];

            if (bufferPacket) {
                bufferPacket.destination_mac = isIpInARPTable(routerObjectId, packet.origin_ip);
                delete buffer[routerObjectId];
                addPacketTraffic(bufferPacket);
                await switchProcessor(switchId, routerObjectId, bufferPacket);
            }

            return;
        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            icmpFlag = true;
            return;
        }

    }

    if (!isSameNetwork || availableIps.includes(packet.origin_ip)) await routing(routerObjectId, packet);

}

async function routing(routerObjectId, packet) {

    const $routerObject = document.getElementById(routerObjectId);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $rows = routingTable.querySelectorAll("tr");

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

                if (rulenexthop === "0.0.0.0") {
                    await arpResolve(routerObjectId, packet.destination_ip, ruleInterface);
                } else {
                    await arpResolve(routerObjectId, rulenexthop, ruleInterface);
                }

                return;
            }

            packet.destination_mac = nexthopMac;
            addPacketTraffic(packet);
            await switchProcessor(nextSwitch, routerObjectId, packet);
            return;
        }

    }

}
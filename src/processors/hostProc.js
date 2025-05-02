async function packetProcessor_Host(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    const $networkObject = document.getElementById(networkObjectId);
    const interface = switchToInterface(networkObjectId, switchId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${interface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${interface}`);
    const activeServices = getActiveServices(networkObjectId);

    if (!networkObjectIp || !networkObjectMac) return;

    if (!firewallProcessorFilter(networkObjectId, packet, "INPUT", interface, "")) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

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

        let newPacket = new synAck(
            networkObjectIp, //ip del origen
            packet.origin_ip, //ip del destino
            networkObjectMac, //mac del origen
            packet.origin_mac, //mac del destino
            packet.dport, //puerto del origen
            packet.sport //puerto del destino
        );

        newPacket.ack_number = packet.sequence_number + 1; // <--- el ack debe ser el siguiente número de secuencia

        tcpBuffer[networkObjectId] = newPacket.sequence_number;

        await hostRouting(networkObjectId, newPacket);
        return;

    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack") {

        if (packet.destination_ip !== networkObjectIp) return; 

        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return;

        let newPacket = new Ack(
            networkObjectIp, //ip del origen
            packet.origin_ip, //ip del destino
            networkObjectMac, //mac del origen
            packet.origin_mac, //mac del destino
            packet.dport, //puerto del origen
            packet.sport //puerto del destino
        );

        newPacket.ack_number = packet.sequence_number + 1; // <--- el ack debe ser el siguiente número de secuencia
        newPacket.sequence_number = packet.ack_number - 1; //<--- el paquete debe tener la secuencia correcta

        tcpSyncFlag[networkObjectId] = true;

        await hostRouting(networkObjectId, newPacket);
        
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack-reply") {
        if (packet.destination_ip !== networkObjectIp) return;
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return;
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

async function hostRouting(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const destinationIp = packet.destination_ip;
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr"); 

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") { // <--- como es broadcast se envia directamente
        const switchId = $networkObject.getAttribute(`data-switch-${getInterfaces($networkObject.id)[0]}`);
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;
    }

    for (let i = 1; i < $routingRules.length; i++) {

        let $rule = $routingRules[i];
        let $cells = $rule.querySelectorAll("td");
        let ruleNetwork = $cells[0].innerHTML;
        let ruleNetmask = $cells[1].innerHTML;
        let ruleInterface = $cells[3].innerHTML;
        let rulenexthop = $cells[4].innerHTML;

        if (ruleNetwork === getNetwork(destinationIp, ruleNetmask)) {

            const nextSwitch = $networkObject.getAttribute("data-switch-" + ruleInterface);
            packet.origin_mac = $networkObject.getAttribute("mac-" + ruleInterface);
            packet.destination_mac = "";
            let nexthopMac;
            
            if (rulenexthop === "0.0.0.0") {
                nexthopMac = isIpInARPTable(networkObjectId, packet.destination_ip) || await arpResolve(networkObjectId, packet.destination_ip);
            } else {
                nexthopMac = isIpInARPTable(networkObjectId, rulenexthop) || await arpResolve(networkObjectId, rulenexthop);
            }

            if (!nexthopMac) return;

            packet.destination_mac = nexthopMac;

            if (!firewallProcessorFilter(networkObjectId, packet, "OUTPUT", "", ruleInterface)) {
                if (visualToggle) igniteFire(networkObjectId);
                return;
            }

            addPacketTraffic(packet);
            await switchProcessor(nextSwitch, networkObjectId, packet);
            return;

        }

    }

}
async function generalProcessorRouter(switchId, routerObjectId, packet) {

    if (visualToggle) await visualize(switchId, routerObjectId, packet); //<-- animacion del paquete

    const [routerObjectIp, routerObjectNetmask, routerObjectMac] = getInterfaceSwitchInfo(routerObjectId, switchId);
    const interface = switchToInterface(routerObjectId, switchId); // <-- obtenemos la interfaz de entrada
    const availableIps = getAvailableIps(routerObjectId); // <-- obtenemos la lista de IPs disponibles
    const activeServices = getAvailableServices(routerObjectId); // <-- obtenemos la lista de servicios activos

    if (!routerObjectIp || !routerObjectNetmask || !routerObjectMac) return; //si la interfaz no está correctamente configurada, no se procesa nada

    if (packet.ttl) { //<-- reducimos el TTL del paquete si es necesario

        packet.ttl--;

        if (packet.ttl < 1) {
            let newPacket = new IcmpTimeExceeded(routerObjectIp, packet.origin_ip, routerObjectMac, routerObjectMac);
            await routing(routerObjectId, newPacket);
            return;
        }

    }

    //<-- miramos si existe una conexion entre el origen y el destino, y deshacemos el SNAT/DNAT si es necesario

    if (Object.hasOwn(connTrack, routerObjectId) && connTrack[routerObjectId][packet.origin_ip]) {
        packet.destination_ip = connTrack[routerObjectId][packet.origin_ip];
        delete connTrack[routerObjectId][packet.origin_ip];
    }

    //<-- si el paquete va dirigido a una IP del router, o es broadcast, se procesa y genera respuesta

    if (availableIps.includes(packet.destination_ip) || packet.destination_ip === "255.255.255.255") {

        if (!firewallProcessorFilter(routerObjectId, packet, "INPUT", interface, "")) { // <-- filtramos el paquete por la tabla filter
            if (visualToggle) igniteFire(routerObjectId);
            return;
        }

        let replyPacket; //<-- inicializamos el paquete de respuesta (si es necesario)

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
            arpFlag[routerObjectId] = true; // <-- señalizamos que se ha recibido la respuesta ARP
            addARPEntry(routerObjectId, packet.origin_ip, packet.origin_mac);
            buffer[routerObjectId] = packet; // <-- se añade el paquete al buffer para ser procesado por el servicio ARP
        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            if (!availableIps.includes(packet.destination_ip)) return;
            icmpFlag[routerObjectId] = true; // <-- señalizamos que se ha recibido la respuesta ICMP
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
                    addPacketTraffic(replyPacket);
                    await switchProcessor(switchId, routerObjectId, replyPacket); // <-- como es broadcast se envia directamente a la red
                }

                return;
            }

            if (activeServices.includes("dhcrelay")) {

                replyPacket = await dhcrelay_service(routerObjectId, packet);

                if (!replyPacket) return;

                if (replyPacket.type === "discover" || replyPacket.type === "request") await routing(routerObjectId, replyPacket);

                if (replyPacket.type === "offer" || replyPacket.type === "ack") { 
                    let switchOut = getInfoFromIp(routerObjectId, replyPacket.giaddr)[1];
                    if (!switchOut) return;
                    addPacketTraffic(replyPacket);
                    await switchProcessor(switchOut, routerObjectId, replyPacket); // <-- como debe ir por broadcast se lanza directamente a la red
                }

                return;
            }

        }

        if (!replyPacket) return;
        else {
            await routing(routerObjectId, replyPacket); 
            return;
        }

    }

    await routing(routerObjectId, packet); // <--- si el paquete no va dirigido a una IP del router, se enruta directamente

}

async function routing(routerObjectId, packet) {

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") return; // <-- no enrutamos tráfico broadcast

    const $routerObject = document.getElementById(routerObjectId);
    const $routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");

    for (let i = 1; i < $routingRules.length; i++) {

        let $rule = $routingRules[i];
        let $fields = $rule.querySelectorAll("td");
        let ruleNetwork = $fields[0].innerHTML;
        let ruleNetmask = $fields[1].innerHTML;
        let ruleInterface = $fields[3].innerHTML;
        let rulenexthop = $fields[4].innerHTML;

        if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) {

            packet.origin_mac = $routerObject.getAttribute("mac-" + ruleInterface); //<-- la mac de origen es la de la interfaz de salida
            packet.destination_mac = ""; //<-- la mac de destino todavia es desconocida

            let nexthopMac;

            if (rulenexthop === "0.0.0.0") { //<-- si es una regla de conexion directa, se busca la mac del destino directamente

                nexthopMac = isIpInARPTable(routerObjectId, packet.destination_ip) || await arpResolve(routerObjectId, packet.destination_ip, ruleInterface);

            } else { //<-- si es una regla de conexion remota, se busca la mac del siguiente salto

                nexthopMac = isIpInARPTable(routerObjectId, rulenexthop) || await arpResolve(routerObjectId, rulenexthop, ruleInterface);

            }

            if (!nexthopMac) return;

            packet.destination_mac = nexthopMac;

            await firewallProc(routerObjectId, packet, ruleInterface); //<-- enviamos el paquete al firewall
            return;

        }

    }

}

async function firewallProc(routerObjectId, packet, outputInterface) {

    const $networkObject = document.getElementById(routerObjectId);
    const availableIps = getAvailableIps(routerObjectId);
    const nextSwitch = $networkObject.getAttribute("data-switch-" + outputInterface);

    //<-- si el origen es el propio router, se procesa por OUTPUT

    if (availableIps.includes(packet.origin_ip) && !firewallProcessorFilter(routerObjectId, packet, "OUTPUT", "", outputInterface)) {
        if (visualToggle) igniteFire(routerObjectId);
        return;
    }

    //<-- si el origen no es el propio router, se procesa por FORWARD

    if (!availableIps.includes(packet.origin_ip) && !firewallProcessorFilter(routerObjectId, packet, "FORWARD", "", outputInterface)) {
        if (visualToggle) igniteFire(routerObjectId);
        return;
    }

    //<-- se procesa el POSTROUTING (SNAT)

    packet = firewallProcessorNat(routerObjectId, packet, "", outputInterface, "POSTROUTING");

    addPacketTraffic(packet);
    await switchProcessor(nextSwitch, routerObjectId, packet);
    return;
}
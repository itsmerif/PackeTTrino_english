async function packetProcessor_router(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    //bloqueo de paquetes

    if (!firewallProcessorRouter(networkObjectId, packet)) return;

    if (packet.destination_ip === "255.255.255.255") { //no hacemos nada con trafico dirigido a broadcast
        return;
    }

    //obtenemos especificaciones del router

    const $routerObject = document.getElementById(networkObjectId);
    const routerObjectMac = $routerObject.getAttribute("mac-enp0s3");
    const availableIps = [$routerObject.getAttribute("ip-enp0s3"), $routerObject.getAttribute("ip-enp0s8"), $routerObject.getAttribute("ip-enp0s9")];

    let networkObjectIp; let networkObjectNetmask;

    switch (switchId) {
        case $routerObject.getAttribute("data-switch-enp0s3"):
            networkObjectIp = $routerObject.getAttribute("ip-enp0s3");
            networkObjectNetmask = $routerObject.getAttribute("netmask-enp0s3");
            break;
        case $routerObject.getAttribute("data-switch-enp0s8"):
            networkObjectIp = $routerObject.getAttribute("ip-enp0s8");
            networkObjectNetmask = $routerObject.getAttribute("netmask-enp0s8");
            break;
        case $routerObject.getAttribute("data-switch-enp0s9"):
            networkObjectIp = $routerObject.getAttribute("ip-enp0s9");
            networkObjectNetmask = $routerObject.getAttribute("netmask-enp0s9");
            break;
    }

    //el paquete pasa, tenemos que mirar el TTL y reducirlo

    if (packet.ttl && !availableIps.includes(packet.origin_ip))  {          
        packet.ttl--;
        if (packet.ttl < 1) {
            packet = new IcmpTimeExceeded(networkObjectIp, packet.origin_ip, routerObjectMac, routerObjectMac); //alteracion de la verdad!!!
        }
    }

    //procesamiento del paquete

    const isSameNetwork = getNetwork(packet.destination_ip, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);

    if (availableIps.includes(packet.destination_ip)) { //paquete con destino al router

        if (packet.protocol === "arp" && packet.type === "request") {
            addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
            let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }

        if (packet.protocol === "icmp" && packet.type === "request") {
            let newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }

        if (packet.protocol === "arp" && packet.type === "reply") {

            arpFlag = true;

            addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);

            let bufferPacket = buffer[networkObjectId];

            if (bufferPacket) {
                bufferPacket.destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
                delete buffer[networkObjectId]; //borramos el paquete del buffer
                addPacketTraffic(bufferPacket);
                await switchProcessor(switchId, networkObjectId, bufferPacket);
            }

            return;
        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            icmpFlag = true;
            return;
        }

    }

    if (!isSameNetwork || availableIps.includes(packet.origin_ip)) { //paquete con destino otra red o con origen en el router

        //enrutamiento

        const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
        const rows = routingTable.querySelectorAll("tr");

        //reglas de conexion directa

        for (let i = 1; i <= 3; i++) {

            let row = rows[i];
            let cells = row.querySelectorAll("td");
            let ruleNetwork = cells[0].innerHTML;
            let ruleNetmask = cells[1].innerHTML;
            let gateway = cells[2].innerHTML; //ip por esa interfaz
            let ruleInterface = cells[3].innerHTML;

            if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) { //la regla coincide con la red de destino

                const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface); //obtenemos el switch por el que va a saltar
                packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router
                packet.destination_mac = isIpInARPTable(networkObjectId, packet.destination_ip); //cambiamos la mac de destino por la de la tabla de arp

                if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla arp, lo guardamos en el buffer y enviamos un ARP primero
                    buffer[networkObjectId] = packet;
                    let newPacket = new ArpRequest(gateway, packet.destination_ip, routerObjectMac);
                    arpFlag = false;
                    addPacketTraffic(newPacket);
                    await switchProcessor(nextSwitch, networkObjectId, newPacket);
                    return;
                }
                addPacketTraffic(packet);
                await switchProcessor(nextSwitch, networkObjectId, packet);
                return;
            }

        }

        //reglas remotas -> de la 4 hacia delante

        if (rows.length > 4) {

            for (let i = 4; i < rows.length; i++) {

                let row = rows[i];
                let cells = row.querySelectorAll("td");
                let ruleNetwork = cells[0].innerHTML;
                let ruleNetmask = cells[1].innerHTML;
                let gateway = cells[2].innerHTML; //ip por esa interfaz

                if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) { //la regla coincide con la red de destino

                    let ruleInterface = cells[3].innerHTML; //interfaz por la que se va a saltar
                    let nexthop = cells[4].innerHTML; //ip del siguiente salto
                    const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface);
                    packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router
                    packet.destination_mac = isIpInARPTable(networkObjectId, nexthop);

                    if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
                        buffer[networkObjectId] = packet;
                        let newPacket = new ArpRequest(gateway, nexthop, routerObjectMac);
                        arpFlag = false;
                        addPacketTraffic(newPacket);
                        await switchProcessor(nextSwitch, networkObjectId, newPacket);
                        return;
                    }

                    addPacketTraffic(packet);
                    await switchProcessor(nextSwitch, networkObjectId, packet); //mandamos el paquete al switch
                    return;
                }

            }
        }

        //ultimo recurso, miramos la regla por defecto -> en la fila 4

        let row = rows[4];
        let cells = row.querySelectorAll("td");
        let gateway = cells[2].innerHTML;

        if (gateway !== "") { //si no hay regla por defecto, no tenemos que comprobar nada
            let ruleInterface = cells[3].innerHTML;
            let nexthop = cells[4].innerHTML;
            const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface);
            packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router
            packet.destination_mac = isIpInARPTable(networkObjectId, nexthop);

            if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
                buffer[networkObjectId] = packet;
                let newPacket = new ArpRequest(gateway, nexthop, routerObjectMac);
                arpFlag = false;
                addPacketTraffic(newPacket);
                await switchProcessor(nextSwitch, networkObjectId, newPacket);
                return;
            }

            addPacketTraffic(packet);
            await switchProcessor(nextSwitch, networkObjectId, packet); //mandamos el paquete al switch
            return;

        }
        
    }

}
function sendPacket(packet, trace = []) {

    const originIP = packet.origin;
    const destinationIP = packet.destination;

    trace.push(originIP);

    if (!originIP || !destinationIP) {
        throw {
            "message": "No se ha configurado el origen o no hay destino",
            "trace": trace
        }
    }

    if (originIP === destinationIP) {
        return trace;
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);

    if (!origin) {
        throw {
            "message": "El origen no existe",
            "trace": trace
        }
    }

    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchOriginObjectId = NetworkOriginObject.getAttribute("data-switch");

    if (!switchOriginObjectId) {
        throw {
            "message": "No se ha detectado ninguna conexión.",
            "trace": trace
        }
    }

    const originObjectMac = NetworkOriginObject.getAttribute("data-mac");

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {

        if (!isIpInARPTable(originId, destinationIP)) {
            saveMac(switchOriginObjectId, originId, originObjectMac);

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) {
                throw {
                    "message": "Ningún equipo de la red tiene esa IP.",
                    "trace": trace
                }
            }

            const [networkDestinationObjectId, networkDestinationObjectmac] = isIpInNetwork(switchOriginObjectId, destinationIP);
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac);
            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac);
            addARPEntry(originId, destinationIP, networkDestinationObjectmac);
            trace.push(destinationIP);
            return trace;
        }

        const destinationMac = isIpInARPTable(originId, destinationIP);
        saveMac(switchOriginObjectId, originId, originObjectMac);

        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) { //no esta la mac en la tabla del switch, hacemos broadcast a todos los equipos conectados

            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) { //ninguno de los equipos acepta la trama y se da por fallido
                //como el equipo origen tenía esta ip con esa mac en su tabla arp, se debe borrar y hacer de nuevo una solicitud arp
                delARPEntry(originId, destinationIP);
                sendPacket(packet, trace);
                return trace;
            }

            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac);

            if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) {
                throw {
                    "message": "La IP de destino no coincide con la IP del equipo destino.",
                    "trace": trace
                }
            }

            saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac);
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac);

            return trace;
        }

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);

        if (!macCheck(networkDestinationObjectId, destinationMac)) {
            throw {
                "message": "La MAC de destino no coincide con la MAC del equipo destino.",
                "trace": trace
            }
        }

        if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) {
            throw {
                "message": "La IP de destino no coincide con la IP del equipo destino.",
                "trace": trace
            }
        }

        return trace;

    } else {

        const defaultGateway = NetworkOriginObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            throw {
                "message": "No existe una puerta de enlace en el origen",
                "trace": trace
            }
        }

        if (!isIpInARPTable(originId, defaultGateway)) {

            const arpRequest = {
                origin: packet.origin,
                destination: defaultGateway,
                protocol: "arp"
            }

            sendPacket(arpRequest);
            sendPacket(packet);
            return;
        }

        trace.push(defaultGateway);
        packet.ttl = packet.ttl - 1; //no tengo que comprobar si es igual a cero, ya que es el salto a la puerta de enlace
        console.log(packet.ttl);
        const defaultGatewayMac = isIpInARPTable(originId, defaultGateway);
        saveMac(switchOriginObjectId, originId, originObjectMac);
        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, defaultGatewayMac);
        routingPacket(packet, networkDestinationObjectId, trace);
        return trace;
    }
}


function routingPacket(packet, routerObjectId, trace) {

    const destinationIP = packet.destination;
    const routerObject = document.getElementById(routerObjectId);
    const routingTable = routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    // Reglas de conexion directa

    for (let i = 1; i <= 3; i++) {

        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ruleNetwork = cells[0].innerHTML;
        let ruleNetmask = cells[1].innerHTML;
        let ruleInterface = cells[3].innerHTML;
        if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) {

            const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);

            if (!isIpInNetwork(switchId, destinationIP)) {
                throw {
                    "message": "Ningún equipo de la red tiene esa IP.",
                    "trace": trace
                }
            }

            trace.push(destinationIP);
            packet.ttl = packet.ttl - 1;;

            if (packet.ttl === 0) {
                throw {
                    "message": "El TTL del paquete ha llegado a cero.",
                    "trace": trace
                }
            }

            return trace;
        }
    }

    // Reglas remotas -> de la fila 5 a la ultima

    if (rows.length > 4) {

        for (let i = 4; i < rows.length; i++) {
            let row = rows[i];
            let cells = row.querySelectorAll("td");
            let ruleNetwork = cells[0].innerHTML;
            let ruleNetmask = cells[1].innerHTML;

            if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) {
                let ruleInterface = cells[3].innerHTML;
                let nexthop = cells[4].innerHTML;
                const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);

                if (!isIpInNetwork(switchId, nexthop)) {
                    throw {
                        "message": `La dirección ${nexthop} no se encuentra en la red.`,
                        "trace": trace
                    }
                }

                const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0];
                trace.push(nexthop);
                packet.ttl = packet.ttl - 1;

                if (packet.ttl === 0) {
                    throw {
                        "message": "El TTL del paquete ha llegado a cero.",
                        "trace": trace
                    }
                }

                routingPacket(packet, nexthopObjectId, trace);
                return trace;
            }
        }
    }

    // Ultimo recurso, miramos la regla por defecto -> en la fila 4

    let row = rows[4];
    let cells = row.querySelectorAll("td");
    let gateway = cells[2].innerHTML;

    if (gateway !== "") {
        let ruleInterface = cells[3].innerHTML;
        let nexthop = cells[4].innerHTML;
        const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);

        if (!isIpInNetwork(switchId, nexthop)) {
            throw {
                "message": `La dirección ${nexthop} no se encuentra en la red.`,
                "trace": trace
            }
        }

        const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0];

        trace.push(nexthop);
        packet.ttl = packet.ttl - 1;

        if (packet.ttl === 0) {
            throw {
                "message": "El TTL del paquete ha llegado a cero.",
                "trace": trace
            }
        }

        routingPacket(packet, nexthopObjectId, trace);
        return trace;
    }

    throw {
        "message": "No existe regla para enrutar el paquete en " + routerObjectId,
        "trace": trace
    }
    
}

function sendPacket(originIP, destinationIP, trace = []) {

    trace.push(originIP);

    if (!originIP || !destinationIP) {
        throw new Error("No se ha configurado el origen o el destino");
    }

    if (originIP === destinationIP) {
        console.log("Paquete recibido. Saltos:", trace);
        return trace;
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);

    if (!origin) {
        throw new Error("El origen no existe");
    }

    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchOriginObjectId = NetworkOriginObject.getAttribute("data-switch");

    if (!switchOriginObjectId) {
        throw new Error("No se ha detectado ninguna conexión.");
    }

    const originObjectMac = NetworkOriginObject.getAttribute("data-mac");

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {

        if (!isIpInARPTable(originId, destinationIP)) {
            saveMac(switchOriginObjectId, originId, originObjectMac);

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) {
                throw new Error("Ningún equipo de la red tiene esa IP.");
            }

            const [networkDestinationObjectId, networkDestinationObjectmac] = isIpInNetwork(switchOriginObjectId, destinationIP);
            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac);
            addARPEntry(originId, destinationIP, networkDestinationObjectmac);
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac);
            return trace;
        }

        const destinationMac = isIpInARPTable(originId, destinationIP);
        saveMac(switchOriginObjectId, originId, originObjectMac);

        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) {

            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) {
                throw new Error("La MAC de destino no existe en la red");
            }

            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac);

            if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) {
                throw new Error("La IP de destino no coincide con la IP del equipo destino.");
            }

            saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac);
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac);

            return trace;
        }

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);

        if (!macCheck(networkDestinationObjectId, destinationMac)) {
            throw new Error("La MAC de destino no coincide con la MAC del equipo destino.");
        }

        if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) {
            throw new Error("La IP de destino no coincide con la IP del equipo destino.");
        }

        return trace;

    } else {
        
        const defaultGateway = NetworkOriginObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            throw new Error("No existe una puerta de enlace en el origen");
        }

        if (!isIpInARPTable(originId, defaultGateway)) {
            sendPacket(originIP, defaultGateway, trace);
            sendPacket(originIP, destinationIP, trace);
            return trace;
        }

        trace.push(defaultGateway);     
        const defaultGatewayMac = isIpInARPTable(originId, defaultGateway);
        saveMac(switchOriginObjectId, originId, originObjectMac);
        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, defaultGatewayMac);
        routingPacket(originId, originIP, destinationIP, networkDestinationObjectId, trace);
        return trace;
    }
}


function routingPacket(networkOriginObjectId, networkOriginObjectIp, destinationIP, routerObjectId, trace) {

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
                throw new Error("Ningún equipo de la red tiene esa IP.");
            }

            trace.push(destinationIP);
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
                    throw new Error(`La dirección ${nexthop} no se encuentra en la red.`);
                }

                const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0];
                trace.push(nexthop);
                routingPacket(networkOriginObjectId, networkOriginObjectIp, destinationIP, nexthopObjectId, trace);
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
            throw new Error(`La dirección ${nexthop} no se encuentra en la red.`);
        }

        const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0];
        trace.push(nexthop);
        routingPacket(networkOriginObjectId, networkOriginObjectIp, destinationIP, nexthopObjectId, trace);
        return trace;
    }

    throw new Error("No existe regla para enrutar el paquete en " + routerObjectId);
}

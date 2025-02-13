function sendPacket(originIP, destinationIP) {

    if (!originIP || !destinationIP) {
        throw new Error("No se ha configurado el origen o el destino");
    }

    if (originIP === destinationIP) {
        return;
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);

    if (!origin) { 
        throw new Error("El origen no existe");
    }

    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchOriginObjectId = NetworkOriginObject.getAttribute("data-switch");
 
    if (!switchOriginObjectId){ //el pc no está conectado a ningún switch
        throw new Error("No se ha detectado ninguna conexión.")
    }

    const originObjectMac = NetworkOriginObject.getAttribute("data-mac");

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //si el destino y origen están en la misma red

        if (!isIpInARPTable(originId, destinationIP)) { //el equipo destino NO está en la tabla ARP del equipo origen

            saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) { //ninguno de los equipos acepta la trama y se da por fallido
                throw new Error("Ningún equipo de la red tiene esa IP.");
            }

            const [networkDestinationObjectId, networkDestinationObjectmac] = isIpInNetwork(switchOriginObjectId, destinationIP);
            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac); //añadimos la mac al switch del destino si no estaba ya
            addARPEntry(originId, destinationIP, networkDestinationObjectmac); //añadimos la ip y mac al equipo origen
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac); //añadimos la ip y mac al equipo destino
            return;
        }

        //el equipo destino está en la tabla ARP del equipo origen

        const destinationMac = isIpInARPTable(originId, destinationIP); // Hemos encontrado la mac del equipo destino.
        saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) { //la mac de destino NO existe en la tabla del switch

            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) {
                throw new Error("La MAC de destino no existe en la red");
            }

            //bingo, uno de los equipos nos devuelva una respuesta confirmando su mac
            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac);

            if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) { //si la ip de destino del paquete no coincide con la ip del equipo, se da por fallido
                throw new Error("La IP de destino no coincide con la IP del equipo destino.");
            }

            saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac); //añadimos la mac al switch
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac);

            return;
        }

        //la mac de destino existe en la tabla del switch. el switch envia una trama unicast al destino.

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);

        //una vez que llega al equipo, debemos hacer comprobaciones a nivel de enlace de datos y de red

        if (!macCheck(networkDestinationObjectId, destinationMac)) { //si la mac de destino en la trama no coincide con la mac del equipo, se da por fallido
            throw new Error("La MAC de destino no coincide con la MAC del equipo destino.");
        }

        if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) { //si la ip de destino del paquete no coincide con la ip del equipo, se da por fallido
            throw new Error("La IP de destino no coincide con la IP del equipo destino.");
        }

        return;

    } else {

        //el destino no está en la misma red

        const defaultGateway = NetworkOriginObject.getAttribute("data-gateway"); //obtenemos la puerta de enlace

        if (!defaultGateway) { //no existe una puerta de enlace en el origen, damos por fallido
            throw new Error("No existe una puerta de enlace en el origen");
        }

        if (!isIpInARPTable(originId, defaultGateway)) { // la ip de la puerta de enlace no está en la tabla ARP del origen. la descubrimos primero
            sendPacket(originIP, defaultGateway); //llama a la funcion de nuevo
            sendPacket(originIP, destinationIP); //reiniciamos la llamada ahora con la tabla de arp actualizada
            return;
        }

        //la ip de la puerta de enlace está en la tabla ARP del origen

        const defaultGatewayMac = isIpInARPTable(originId, defaultGateway); // Hemos encontrado la mac del equipo destino. Enviamos una trama unicast al switch con esa mac de destino    
        saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, defaultGatewayMac);
        routingPacket(originId, originIP, destinationIP, networkDestinationObjectId);
        return;
        
    }


}

function routingPacket(networkOriginObjectId, networkOriginObjectIp, destinationIP, routerObjectId) {

    const routerObject = document.getElementById(routerObjectId); //obtenemos el router
    const routingTable = routerObject.querySelector(".routing-table").querySelector("table"); //obtenemos la tabla de enrutamiento
    const rows = routingTable.querySelectorAll("tr"); //obtenemos las filas de la tabla

    //reglas de conexion directa

    for (let i = 1; i <=3 ; i++) {

        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ruleNetwork = cells[0].innerHTML;
        let ruleNetmask = cells[1].innerHTML;
        let ruleInterface = cells[3].innerHTML;

        if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) { //la red destino coincide con la red de la regla de conexion directa, solo falta enviar la trama

            const switchId = routerObject.getAttribute("data-switch-" + ruleInterface); 

            if (!isIpInNetwork(switchId, destinationIP)) { //ninguno de los equipos acepta la trama y se da por fallido
                throw new Error("Ningún equipo de la red tiene esa IP.");
            }

            return;
        }

    }

    //reglas remotas -> de la fila 5 a la ultima

    if (rows.length > 4) { // hay reglas remotas

        for (let i = 4; i < rows.length; i++) {

            let row = rows[i];
            let cells = row.querySelectorAll("td");
            let ruleNetwork = cells[0].innerHTML;
            let ruleNetmask = cells[1].innerHTML;

            if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) { //le red destino coincide con la red de la regla remota

                let ruleInterface = cells[3].innerHTML;
                let nexthop = cells[4].innerHTML; //siguiente salto
                const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);

                if (!isIpInNetwork(switchId, nexthop)) { //la direccion Ip del nexthop no esta en la red del switch, se da por fallido
                    throw new Error(`La dirección ${nexthop} no se encuentra en la red.`)
                }

                const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0]; //hemos encontrado el router que reenviara el paquete
                routingPacket(networkOriginObjectId, networkOriginObjectIp, destinationIP, nexthopObjectId); //llamamos a la funcion recursiva para enviar el paquete por el siguiente salto
                return; 
            }

        }
        
    }

    //ultimo recurso, miramos la regla por defecto -> en la fila 4

    let row = rows[4];
    let cells = row.querySelectorAll("td");
    let gateway = cells[2].innerHTML;

    if (gateway !== "") { //se ha configurado la regla por defecto

        let ruleInterface = cells[3].innerHTML;
        let nexthop = cells[4].innerHTML;
        const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);

        if (!isIpInNetwork(switchId, nexthop)) { //la direccion Ip del nexthop no esta en la red del switch, se da por fallido
            throw new Error(`La dirección ${nexthop} no se encuentra en la red.`)
        }

        const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0]; //hemos encontrado el router que reenviara el paquete

        routingPacket(networkOriginObjectId, networkOriginObjectIp, destinationIP, nexthopObjectId); //llamamos a la funcion recursiva para enviar el paquete por el siguiente salto
        return;
        
    }

    //se da por fallido

    throw new Error("No existe regla para enrutar el paquete en " + routerObjectId)

}
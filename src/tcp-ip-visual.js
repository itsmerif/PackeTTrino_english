function waitForMove() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

async function sendPacketVisual(packet) {
    //renombramos variables
    const originIP = packet.origin;
    const destinationIP = packet.destination;
    //comprobamos que el paquete tiene origen y destino
    if (!originIP || !destinationIP) return false;
    //comprobamos que el origen y el destino no son iguales
    if (originIP === destinationIP) return true;
    //obtenemos las propiedades del paquete
    const networkOriginObject = document.querySelector(`[data-ip="${originIP}"]`);
    const networkOriginObjectId = networkOriginObject.id;
    const networkOriginObjectNetmask = networkOriginObject.getAttribute("data-netmask");
    const networkOriginObjectMac = networkOriginObject.getAttribute("data-mac");
    const switchOriginObjectId = networkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchOriginObjectId);
    //comprobamos que el equipo está conectado a un switch
    if (!switchOriginObjectId) return false;
    //comprobamos si el destino está en la misma red que el origen
    if (getNetwork(originIP, networkOriginObjectNetmask) === getNetwork(destinationIP, networkOriginObjectNetmask)) { //están en la misma red
        //comprobamos si el destino está en la tabla arp del equipo origen
        if (!isIpInARPTable(networkOriginObjectId, destinationIP)) { //el destino no está en la tabla arp del origen
            //el origen envia una solicitud arp al switch
            await movePacket(networkOriginObject.style.left, networkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast");
            //el switch guarda la mac del origen en su tabla mac (si no la tiene)
            saveMac(switchOriginObjectId, networkOriginObjectId, networkOriginObjectMac);
            //el switch reenvia la solicitud a todos los equipos conectados
            broadcastSwitch(switchOriginObjectId, networkOriginObjectId);
            await waitForMove();
            //los equipos de la red valoran la solicitud arp
            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) return false;
            //un equipo confirma que tiene esa ip
            const [networkDestinationObjectId, networkDestinationObjectmac] = isIpInNetwork(switchOriginObjectId, destinationIP);
            const networkDestinationObject = document.getElementById(networkDestinationObjectId);
            //el destino añade el origen a su tabla arp
            addARPEntry(networkDestinationObjectId, originIP, networkOriginObjectMac);
            //se envia una respuesta arp al switch
            await movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "arpreply");
            //el switch añade el destino a su tabla mac
            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac);
            //el switch envia la respuesta al origen
            await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkOriginObject.style.left, networkOriginObject.style.top, "arpreply");
            //el origen añade el destino a su tabla arp
            addARPEntry(networkOriginObjectId, destinationIP, networkDestinationObjectmac);
            return true;
        }
        //el destino está en la tabla arp del origen
        const destinationMac = isIpInARPTable(networkOriginObjectId, destinationIP);
        //enviamos un icmp echo request por unicast al switch
        await movePacket(networkOriginObject.style.left, networkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
        //el switch añade el origen a su tabla mac (si no la tiene)
        saveMac(switchOriginObjectId, networkOriginObjectId, networkOriginObjectMac);
        //el switch comprueba si la mac de destino está en su tabla mac
        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) { //no esta la mac en la tabla del switch
            //el switch satura todos los puertos conectados excepto el origen
            broadcastSwitch(switchOriginObjectId, networkOriginObjectId);
            await waitForMove();
            //los equipos de la red valoran la trama
            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) { //ninguno de los equipos acepta la trama y se da por fallido
                //al no recibir respuesta, se elimina la ip de destino de la tabla arp del origen y se envia una solicitud arp
                delARPEntry(networkOriginObjectId, destinationIP);
                sendPacketVisual(packet);
                return false;
            }
            //uno de los equipos acepta la trama y debe comprobar si la ip de destino coincide con la ip del equipo destino
            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac);
            if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) {
                //al no recibir respuesta, se elimina la ip de destino de la tabla arp del origen y se envia una solicitud arp
                delARPEntry(networkOriginObjectId, destinationIP);
                sendPacketVisual(packet);
                return false;
            }
            //el destino añade al origen a su tabla arp
            addARPEntry(networkDestinationObjectId, originIP, networkOriginObjectMac);
            //el equipo acepta el paquete y devuelve un paquete icmp con echo reply al switch
            await movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
            //el switch añade el destino a su tabla mac (si no la tiene)
            saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac);
            //el switch devuelve una echo reply al origen
            await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkOriginObject.style.left, networkOriginObject.style.top, "unicast");
            return true;
        }
        //el destino está en la tabla mac del switch
        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);
        const networkDestinationObject = document.getElementById(networkDestinationObjectId);
        //el switch envia el echo request por unicast al destino
        await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkDestinationObject.style.left, networkDestinationObject.style.top, "unicast");
        //el paquete es procesado por el destino
        if (!macCheck(networkDestinationObjectId, destinationMac)) return false;
        if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) return false;
        //el destino confirma el paquete
        //añade el origen a su tabla arp (si no la tiene)
        addARPEntry(networkDestinationObjectId, originIP, networkOriginObjectMac);
        //envia un echo reply por unicast al switch
        await movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
        //el switch añade el destino a su tabla mac (si no la tiene)
        saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac);
        //reenvia el echo reply por unicast al origen
        await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkOriginObject.style.left, networkOriginObject.style.top, "unicast");
        return true;

    } else { //diferente red
        //obtenemos la puerta de enlace del origen
        const defaultGateway = networkOriginObject.getAttribute("data-gateway");
        if (!defaultGateway) return false;
        //comprobamos si la ip de la puerta de enlace está en la tabla arp del origen
        if (!isIpInARPTable(networkOriginObjectId, defaultGateway)) {
            const arpRequest = {
                origin: packet.origin,
                destination: defaultGateway,
                protocol: "arp"
            }
            //enviamos una solicitud arp al switch. si tiene exito, se reinicia el proceso
            await sendPacketVisual(arpRequest);
            sendPacketVisual(packet);
            return false;
        }
        //la puerta de enlace está en la tabla arp del origen
        const defaultGatewayMac = isIpInARPTable(networkOriginObjectId, defaultGateway);
        //el origen envia el icmp echo request por unicast al switch
        await movePacket(networkOriginObject.style.left, networkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
        //el switch añade el origen a su tabla mac (si no la tiene)
        saveMac(switchOriginObjectId, networkOriginObjectId, networkOriginObjectMac);
        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, defaultGatewayMac); //obtenemos el id del destino
        const networkDestinationObject = document.getElementById(networkDestinationObjectId);
        //el switch envia el echo request por unicast al destino
        await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkDestinationObject.style.left, networkDestinationObject.style.top, "unicast");
        //el paquete es procesado por el destino
        await routingPacketVisual(packet, networkDestinationObjectId);
    }
}

async function routingPacketVisual(packet, routerObjectId) {
    //extraigo el destino del paquete
    const destinationIP = packet.destination;
    //obtengo la tabla de enrutamiento del dispositivo enrutador y evaluamos si existe una regla para el destino
    const routerObject = document.getElementById(routerObjectId);
    const routingTable = routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");
    //Reglas de conexion directa
    for (let i = 1; i <= 3; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ruleNetwork = cells[0].innerHTML;
        let ruleNetmask = cells[1].innerHTML;
        let ruleInterface = cells[3].innerHTML;
        if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) { //una regla de conexion directa coincide con el destino
            //obtenemos el switch al que está conectado el dispositivo enrutador por la interfaz que tiene la regla
            const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);
            const networkSwitchObject = document.getElementById(switchId);
            //enviamos el paquete por unicast al switch
            await movePacket(routerObject.style.left, routerObject.style.top, networkSwitchObject.style.left, networkSwitchObject.style.top, "unicast");
            //el switch realiza un broadcast a todos los equipos conectados
            broadcastSwitch(switchId, routerObjectId);
            await waitForMove();
            //los equipos de la red valoran la trama
            if (!isIpInNetwork(switchId, destinationIP)) return false;
            //el paquete ha llegado a un equipo que acepta la trama
            return true;
        }
    }
    //Reglas remotas -> de la fila 5 a la ultima
    if (rows.length > 4) {
        for (let i = 4; i < rows.length; i++) {
            let row = rows[i];
            let cells = row.querySelectorAll("td");
            let ruleNetwork = cells[0].innerHTML;
            let ruleNetmask = cells[1].innerHTML;
            if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) { //una regla remota coincide con el destino
                let ruleInterface = cells[3].innerHTML;
                let nexthop = cells[4].innerHTML; //obtengo el siguiente hop
                //obtenemos el switch al que está conectado el dispositivo enrutador por la interfaz que tiene la regla
                const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);
                const networkSwitchObject = document.getElementById(switchId);
                //enviamos el paquete por unicast al switch
                await movePacket(routerObject.style.left, routerObject.style.top, networkSwitchObject.style.left, networkSwitchObject.style.top, "unicast");
                //el switch realiza un broadcast a todos los equipos conectados
                broadcastSwitch(switchId, routerObjectId);
                await waitForMove();
                //los equipos de la red valoran la trama
                if (!isIpInNetwork(switchId, nexthop)) return false;
                //obtengo el id del nuevo dispositivo enrutador
                const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0];
                //ahora desde el nuevo dispositivo enrutador, se procesa el paquete
                routingPacketVisual(packet, nexthopObjectId);
            }
        }
    }

    // Ultimo recurso, miramos la regla por defecto -> en la fila 4
    let row = rows[4];
    let cells = row.querySelectorAll("td");
    let gateway = cells[2].innerHTML;
    if (gateway !== "") { //comprobamos que se ha definido una regla por defecto
        let ruleInterface = cells[3].innerHTML;
        let nexthop = cells[4].innerHTML;
        //obtenemos el switch al que está conectado el dispositivo enrutador por la interfaz que tiene la regla
        const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);
        //comprobamos que la ip de destino está en la red
        if (!isIpInNetwork(switchId, nexthop)) return false;
        //obtenemos el id del nuevo dispositivo enrutador
        const nexthopObjectId = isIpInNetwork(switchId, nexthop)[0];
        //ahora desde el nuevo dispositivo enrutador, se procesa el paquete
        routingPacketVisual(packet, nexthopObjectId);
    }

    //si no se puede enrutar, lo damos por fallido
    return false;

}
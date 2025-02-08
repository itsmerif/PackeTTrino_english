function waitForMove() {
    return new Promise(resolve => setTimeout(resolve, 1000)); // espera de 1 segundo
}

async function pingOnlyVisual(originIP, destinationIP) {

    // Compruebo que el equipo origen está configurado

    if (!originIP) {
        return;
    }

    // si el origen y el destino es el mismo, es un loopback

    if (originIP === destinationIP) {
        return;
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchOriginObjectId = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchOriginObjectId);
    const originObjectMac = NetworkOriginObject.getAttribute("data-mac");

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //si el destino y origen están en la misma red

        if (!isIpInARPTable(originId, destinationIP)) { //el equipo destino NO está en la tabla ARP del equipo origen

            //el pc envia una trama broadcast al swich
            movePacket(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast"); 
            await waitForMove();

            saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

            //ahora el switch satura los puertos y los equipos conectados comprueban si su IP es la  IP de destino del paquete

            broadcastSwitch(switchOriginObjectId, originId );
            await waitForMove();

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) { //ninguno de los equipos acepta la trama y se da por fallido
                return;
            }

            // bingo, tenemos una respuesta confirmando su mac");

            const networkDestinationObjectId = isIpInNetwork(switchOriginObjectId, destinationIP)[0]; //recuperamos el id del equipo que nos devuelve la respuesta
            const networkDestinationObjectmac = isIpInNetwork(switchOriginObjectId, destinationIP)[1]; //recuperamos la mac del equipo que nos devuelve la respuesta
            const networkDestinationObject = document.getElementById(networkDestinationObjectId); //recuperamos el objeto del equipo que nos devuelve la respuesta
            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac); //añadimos la mac al switch del destino si no estaba ya
            addARPEntry(originId, destinationIP, networkDestinationObjectmac); //añadimos la ip y mac al switch del origen

            movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast"); 
            await waitForMove();

            movePacket(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast"); 
            return;

        }

        //el equipo destino está en la tabla ARP del equipo origen

        const destinationMac = isIpInARPTable(originId, destinationIP); // Hemos encontrado la mac del equipo destino. Enviamos una trama unicast al switch con esa mac de destino
        saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) { //la mac de destino NO existe en la tabla del switch

            //ahora el switch satura todos los puertos e intenta encontrar la mac de destino

            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) { //ninguno de los equipos acepta la trama y se da por fallido
                ping_f(originIP);
                return;
            }

            //bingo, uno de los equipos nos devuelva una respuesta confirmando su mac
            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac); //recuperamos el id del equipo que nos devuelve la respuesta
            saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac); //añadimos la mac al switch
            ping_s(originIP);
            return;
            
        }

        //la mac de destino existe en la tabla del switch. el switch envia una trama unicast al destino.         
        //una vez que llega al equipo, debemos hacer comprobaciones a nivel de enlace de datos y de red

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);

        if (!macCheck(networkDestinationObjectId, destinationMac)) { //si la mac de destino en la trama no coincide con la mac del equipo, se da por fallido
            ping_f(originIP);
            return;
        }

        if (!ipCheck(networkDestinationObjectId, destinationIP)) { //si la ip de destino del paquete no coincide con la ip del equipo, se da por fallido
            ping_f(originIP);
            return;
        }

        ping_s(originIP); //si todo sale bien, se da por exitoso
        return;

    }
}

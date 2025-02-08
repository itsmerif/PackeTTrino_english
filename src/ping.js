function ping(originIP, destinationIP) {

    // Compruebo que el equipo origen está configurado

    if (!originIP) {
        ping_f(originIP);
        return;
    }

    // si el origen y el destino es el mismo, es un loopback

    if (originIP === destinationIP) {
        ping_s(originIP);
        return;
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchOriginObjectId = NetworkOriginObject.getAttribute("data-switch");
    const originObjectMac = NetworkOriginObject.getAttribute("data-mac");

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //si el destino y origen están en la misma red

        if (!isIpInARPTable(originId, destinationIP)) { //el equipo destino NO está en la tabla ARP del equipo origen

            //el pc envia una trama broadcast al swich

            saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

            //ahora el switch satura los puertos y los equipos conectados comprueban si su IP es la  IP de destino del paquete

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) { //ninguno de los equipos acepta la trama y se da por fallido
                ping_f(originIP);
                return;
            }

            //bingo, tenemos una respuesta confirmando su mac

            const networkDestinationObjectId = isIpInNetwork(switchOriginObjectId, destinationIP)[0]; //recuperamos el id del equipo que nos devuelve la respuesta
            const networkDestinationObjectmac = isIpInNetwork(switchOriginObjectId, destinationIP)[1]; //recuperamos la mac del equipo que nos devuelve la respuesta

            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac); //añadimos la mac al switch del destino si no estaba ya

            addARPEntry(originId, destinationIP, networkDestinationObjectmac); //añadimos la ip y mac al switch del origen

            ping_s(originIP); 
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

function ping_s(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 1000);

}

function ping_f(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 1000);

}
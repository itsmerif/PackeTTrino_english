async function ping(originIP, destinationIP, visual = false) {

    // Compruebo que el equipo origen está configurado

    if (!originIP) {
        if (!visual) ping_f(originIP);
        return;
    }

    // si el origen y el destino es el mismo, es un loopback

    if (originIP === destinationIP) {
        if (!visual) ping_s(originIP);
        return;
    }


    const origin = document.querySelector(`[data-ip="${originIP}"]`);

    if (!origin) { //no existe un elemento con esa ip
        if (!visual) ping_f(originIP);
        return;
    }

    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchOriginObjectId = NetworkOriginObject.getAttribute("data-switch");
 
    if (!switchOriginObjectId){ //el pc no está conectado a ningún switch
        if (!visual) ping_f(originIP);
        return
    }

    const switchOriginObject = document.getElementById(switchOriginObjectId);
    const originObjectMac = NetworkOriginObject.getAttribute("data-mac");

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //si el destino y origen están en la misma red

        if (!isIpInARPTable(originId, destinationIP)) { //el equipo destino NO está en la tabla ARP del equipo origen

            if (visual) {
                //el pc envia una trama broadcast al swich
                movePacket(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast");
                await waitForMove();
            }

            saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

            if (visual) {
                //ahora el switch satura los puertos y los equipos conectados comprueban si su IP es la  IP de destino del paquete
                broadcastSwitch(switchOriginObjectId, originId);
                await waitForMove();
            }

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) { //ninguno de los equipos acepta la trama y se da por fallido
                if (!visual) ping_f(originIP);
                return;
            }

            //bingo, tenemos una respuesta confirmando su mac
            const [networkDestinationObjectId, networkDestinationObjectmac] = isIpInNetwork(switchOriginObjectId, destinationIP);
            const networkDestinationObject = document.getElementById(networkDestinationObjectId);

            saveMac(switchOriginObjectId, networkDestinationObjectId, networkDestinationObjectmac); //añadimos la mac al switch del destino si no estaba ya
            addARPEntry(originId, destinationIP, networkDestinationObjectmac); //añadimos la ip y mac al equipo origen
            addARPEntry(networkDestinationObjectId, originIP, originObjectMac); //añadimos la ip y mac al equipo destino

            if (!visual) {
                ping_s(originIP);
            }

            return;
        }

        //el equipo destino está en la tabla ARP del equipo origen

        const destinationMac = isIpInARPTable(originId, destinationIP); // Hemos encontrado la mac del equipo destino. Enviamos una trama unicast al switch con esa mac de destino

        if (visual) {
            movePacket(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
            await waitForMove();
        }

        saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) { //la mac de destino NO existe en la tabla del switch

            //ahora el switch satura todos los puertos e intenta encontrar la mac de destino

            if (visual) {
                broadcastSwitch(switchOriginObjectId, originId);
                await waitForMove();
            }

            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) { //ninguno de los equipos acepta la trama y se da por fallido
                if (!visual) ping_f(originIP);
                return;
            }

            //bingo, uno de los equipos nos devuelva una respuesta confirmando su mac
            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac);
            saveMac(switchOriginObjectId, networkDestinationObjectId, destinationMac); //añadimos la mac al switch

            if (!visual) ping_s(originIP);
            return;
        }

        //la mac de destino existe en la tabla del switch. el switch envia una trama unicast al destino.

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);
        const networkDestinationObject = document.getElementById(networkDestinationObjectId);

        if (visual) {
            movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkDestinationObject.style.left, networkDestinationObject.style.top, "unicast");
            await waitForMove();
        }

        //una vez que llega al equipo, debemos hacer comprobaciones a nivel de enlace de datos y de red

        if (!macCheck(networkDestinationObjectId, destinationMac)) { //si la mac de destino en la trama no coincide con la mac del equipo, se da por fallido
            if (!visual) ping_f(originIP);
            return;
        }

        if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) { //si la ip de destino del paquete no coincide con la ip del equipo, se da por fallido
            if (!visual) ping_f(originIP);
            return;
        }

        if (!visual) {
            ping_s(originIP); //si todo sale bien, se da por exitoso
        }

        return;

    } else {

        //el destino no está en la misma red

        const defaultGateway = NetworkOriginObject.getAttribute("data-gateway"); //obtenemos la puerta de enlace

        if (!defaultGateway) { //no existe una puerta de enlace en el origen, damos por fallido
            if (!visual) ping_f(originIP);
            return;
        }

        if (!isIpInARPTable(originId, defaultGateway)) { // la ip de la puerta de enlace no está en la tabla ARP del origen. la descubrimos primero
            await ping(originIP, defaultGateway, visual); //llama a la funcion de nuevo
            await waitForMove();
            await ping(originIP, destinationIP, visual); //reiniciamos la llamada ahora con la tabla de arp actualizada
            return;
        }

        //la ip de la puerta de enlace está en la tabla ARP del origen

        const defaultGatewayMac = isIpInARPTable(originId, defaultGateway); // Hemos encontrado la mac del equipo destino. Enviamos una trama unicast al switch con esa mac de destino

        if (visual) {
            movePacket(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
            await waitForMove();
        }
        
        saveMac(switchOriginObjectId, originId, originObjectMac); //si el origen no es conocido para el switch, añadimos la mac al switch

        if (!isMacInMACTable(switchOriginObjectId, defaultGatewayMac)) { //la mac de destino NO existe en la tabla del switch

            //ahora el switch satura todos los puertos e intenta encontrar la mac de destino

            if (visual) {
                broadcastSwitch(switchOriginObjectId, originId);
                await waitForMove();
            }

            if (!isMacinNetwork(switchOriginObjectId, defaultGatewayMac)) { //ninguno de los equipos acepta la trama y se da por fallido
                if (!visual) ping_f(originIP);
                return;
            }

            //bingo, uno de los equipos nos devuelva una respuesta confirmando su mac

            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, defaultGatewayMac);
            const networkDestinationObject = document.getElementById(networkDestinationObjectId);

            saveMac(switchOriginObjectId, networkDestinationObjectId, defaultGatewayMac); //añadimos la mac al switch

            if (visual) {
                movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
                await waitForMove();
                movePacket(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
                return;
            } else {
                ping_s(originIP);
                return;
            }


        }

        //la mac de destino existe en la tabla del switch. el switch envia una trama unicast al destino.

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, defaultGatewayMac);
        const networkDestinationObject = document.getElementById(networkDestinationObjectId);

        if (visual) {
            movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkDestinationObject.style.left, networkDestinationObject.style.top, "unicast");
            await waitForMove();
            await routing(originId, originIP, destinationIP, networkDestinationObjectId, visual);
            return;
        }

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

function waitForMove() {
    return new Promise(resolve => setTimeout(resolve, 1000)); // espera de 1 segundo
}

function dragPingForm(event) {

    event.preventDefault();
    document.body.style.cursor = "move";
    const pingform = event.target.closest(".ping-form");
    let rect = pingform.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;
    pingform.style.right = 'auto';
    pingform.style.left = `${rect.left}px`;
    pingform.style.top = `${rect.top}px`;

    function movePingForm(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - pingform.offsetWidth;
        let maxY = window.innerHeight - pingform.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        pingform.style.left = `${x}px`;
        pingform.style.top = `${y}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', movePingForm);
        document.removeEventListener('mouseup', stopDragging);
        document.body.style.cursor = "default";
    }

    document.addEventListener('mousemove', movePingForm);
    document.addEventListener('mouseup', stopDragging);
}
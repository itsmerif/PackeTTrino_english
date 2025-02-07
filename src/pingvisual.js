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
    const arpTable = getARPTable(originId);
    const NetworkOriginObject = document.getElementById(originId);
    const NetworkOriginObjectMac = NetworkOriginObject.getAttribute("data-mac");
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchIdentity);
    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");
    let macs = [];
    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //compruebo que el destino y origen esten en la misma red

        // Buscamos la IP en la tabla ARP del equipo origen

        for (let i = 0; i < arpTable.length; i++) {
            const arpRow = arpTable[i];
            const mac = arpRow[1];
            const ip = arpRow[0];

            if (ip === destinationIP) {
                moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast"); // Unicast al switch
                await waitForMove();
                const macEncontrada = mac; // Hemos encontrado la mac del equipo destino
                for (let i = 0; i < macs.length; i++) { // Ahora buscamos la mac en la tabla del switch
                    const mac = macs[i];
                    if (mac === macEncontrada) { // Si la encontramos, bingo, existe la conexión
                        const pc = document.querySelector(`[data-mac="${mac}"]`);
                        moveObject(switchOriginObject.style.left, switchOriginObject.style.top, pc.style.left, pc.style.top, "unicast");
                        await waitForMove();
                        moveObject(pc.style.left, pc.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
                        await waitForMove();
                        moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
                        return;
                    }
                }
            }
        }

        moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast"); // Broadcast al switch
        await waitForMove();

        //el switch ahora realiza un broadcast a todos los equipos conectados

        for (let i = 0; i < macs.length; i++) {
            const mac = macs[i];
            const pc = document.querySelector(`[data-mac="${mac}"]`);
            if (mac !== NetworkOriginObjectMac) { //no inunda el puerto de origen
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, pc.style.left, pc.style.top, "broadcast");
            }
        }

        await waitForMove(); //esperamos a que el switch haga el broadcast a todos los equipos conectados

        for (let i = 0; i < macs.length; i++) {

            const mac = macs[i];
            const networkObject = document.querySelector(`[data-mac="${mac}"]`);
            const networkObjectId = networkObject.id;
            let ip = "";

            if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("server-")) {

                ip = networkObject.getAttribute("data-ip");

            } else if (networkObjectId.startsWith("router-")) {

                ip = getRouterIp(networkObjectId, switchIdentity);

            }

            if (destinationIP === ip) { // Bingo, hemos encontrado el equipo destino
                addARPEntry(originId, destinationIP, mac);
                moveObject(networkObject.style.left, networkObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
                await waitForMove();
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
                return;
            }
        }

        return;

    } else { //no está en la misma red, usamos el gateway predeterminado

        const NetworkOriginObjectGateway = NetworkOriginObject.getAttribute("data-gateway");

        if (!NetworkOriginObjectGateway) { //no se ha configurado una puerta de enlace predeterminada
            return;
        }

        //buscamos la ip del gateway en la tabla arp del equipo origen

        for (let i = 0; i < arpTable.length; i++) {

            const arpRow = arpTable[i];
            const mac = arpRow[1];
            const ip = arpRow[0];

            if (ip === NetworkOriginObjectGateway) { //hemos encontrado la ip del gateway en la tabla arp del equipo origen

                moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast"); // Unicast al switch

                await waitForMove();

                const macEncontrada = mac; // Hemos encontrado la mac del equipo destino

                for (let i = 0; i < macs.length; i++) { // Ahora buscamos la mac en la tabla del switch

                    const mac = macs[i];

                    if (mac === macEncontrada) { // Si la encontramos, bingo, existe la conexión con la puerta de enlace
                        const NetworkGatewayObject = document.querySelector(`[data-mac="${mac}"]`);
                        moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkGatewayObject.style.left, NetworkGatewayObject.style.top, "unicast");
                        await waitForMove();
                        routing(originId, originIP, destinationIP, NetworkGatewayObject.id); //enviamos la petición de ruteado
                        return;
                    }
                }
            }
        }

        //si no está en la tabla arp del equipo origen, mandamos al switch a mirar los equipos conectados

        moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast"); // Broadcast al switch
        await waitForMove();

        for (let i = 0; i < macs.length; i++) {
            const mac = macs[i];
            const pc = document.querySelector(`[data-mac="${mac}"]`);
            if (mac !== NetworkOriginObjectMac) { //no inunda el puerto de origen
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, pc.style.left, pc.style.top, "broadcast");
            }
        }

        await waitForMove(); //esperamos a que el switch haga el broadcast a todos los equipos conectados

        for (let i = 0; i < macs.length; i++) {

            const mac = macs[i];
            const networkObject = document.querySelector(`[data-mac="${mac}"]`);
            const networkObjectId = networkObject.id;
            let ip = "";

            if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("server-")) {

                ip = networkObject.getAttribute("data-ip");

            } else if (networkObjectId.startsWith("router-")) {

                ip = getRouterIp(networkObjectId, switchIdentity);

            }

            if (NetworkOriginObjectGateway === ip) { // Bingo, hemos encontrado la puerta de enlace predeterminada
                addARPEntry(originId, NetworkOriginObjectGateway, mac);
                moveObject(networkObject.style.left, networkObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
                await waitForMove();
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
                await waitForMove();
                pingOnlyVisual(originIP, destinationIP);
                return;
            }
        }

    }


}
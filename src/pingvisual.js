async function pingOnlyVisual(originIP, destinationIP) {

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
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

    // Compruebo que el equipo origen está configurado

    if (!originIP) {
        return;
    }

    // si el origen y el destino es el mismo, es un loopback

    if (originIP === destinationIP) {
        return;
    }

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
                    moveObject(switchOriginObject.style.left, switchOriginObject.style.top,NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
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
        const pc = document.querySelector(`[data-mac="${mac}"]`);
        const ip = pc.getAttribute("data-ip");
        if (destinationIP === ip) { // Bingo, hemos encontrado el equipo destino
            addARPEntry(originId, destinationIP, mac);
            moveObject(pc.style.left, pc.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
            await waitForMove();
            moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
            return;
        }
    }

    return;
}
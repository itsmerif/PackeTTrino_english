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

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //si el destino y origen están en la misma red

        if (isIpInARPTable(originId, destinationIP)) { // si el equipo destino está en la tabla ARP del equipo origen

            const macEncontrada = isIpInARPTable(originId, destinationIP); // Hemos encontrado la mac del equipo destino

            moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast"); // Unicast al switch
            await waitForMove();

            if (isMacInMACTable(switchIdentity, macEncontrada)) { // Si la mac existe en la tabla del switch

                const pc = document.querySelector(`[data-mac="${macEncontrada}"]`);
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, pc.style.left, pc.style.top, "unicast");
                await waitForMove();
                moveObject(pc.style.left, pc.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
                await waitForMove();
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
                return;

            }

        }

        moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast"); // Broadcast al switch
        await waitForMove();

        broadcastSwitch(switchIdentity, NetworkOriginObjectMac); //el switch ahora realiza un broadcast a todos los equipos conectados, excluyendo al equipo origen
        await waitForMove();

        if (isIpInNetwork(switchOriginObject.id, destinationIP)) { // Si el equipo destino está en la red del switch

            const mac = isIpInNetwork(switchOriginObject.id, destinationIP);
            const networkObject = document.querySelector(`[data-mac="${mac}"]`);
            addARPEntry(originId, destinationIP, mac);
            moveObject(networkObject.style.left, networkObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
            await waitForMove();
            moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkOriginObject.style.left, NetworkOriginObject.style.top, "unicast");
            return;

        }

        return;

    } else {

        //no está en la misma red, usamos el gateway predeterminado

        const NetworkOriginObjectGateway = NetworkOriginObject.getAttribute("data-gateway");

        if (!NetworkOriginObjectGateway) { //no se ha configurado una puerta de enlace predeterminada
            return;
        }

        //buscamos la ip del gateway en la tabla arp del equipo origen

        if (isIpInARPTable(originId, NetworkOriginObjectGateway)) { //hemos encontrado la ip del gateway en la tabla arp del equipo origen

            const macEncontrada = isIpInARPTable(originId, NetworkOriginObjectGateway); //obtenemos la mac de la puerta de enlace

            moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast"); // Unicast al switch
            await waitForMove();

            if (isMacInMACTable(switchIdentity, macEncontrada)) { // Si la mac existe en la tabla del switch

                const NetworkGatewayObject = document.querySelector(`[data-mac="${macEncontrada}"]`);
                moveObject(switchOriginObject.style.left, switchOriginObject.style.top, NetworkGatewayObject.style.left, NetworkGatewayObject.style.top, "unicast");
                await waitForMove();
                routing(originId, originIP, destinationIP, NetworkGatewayObject.id); //enviamos la petición de enrutamiento
                return;

            }
        }

        //si no está en la tabla arp del equipo origen, mandamos al switch a mirar los equipos conectados

        moveObject(NetworkOriginObject.style.left, NetworkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast"); // Broadcast al switch
        await waitForMove();

        broadcastSwitch(switchIdentity, NetworkOriginObjectMac); //el switch ahora realiza un broadcast a todos los equipos conectados, excluyendo al equipo origen
        await waitForMove();

        if (isIpInNetwork(switchOriginObject.id, NetworkOriginObjectGateway)) { // Si el equipo destino está en la red del switch
            
            const mac = isIpInNetwork(switchOriginObject.id, NetworkOriginObjectGateway);
            const networkObject = document.querySelector(`[data-mac="${mac}"]`);

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

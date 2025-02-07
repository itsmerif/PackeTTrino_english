async function routing(originId, originIP, destinationIP, routerId) {

    //evaluamos las reglas de enrutamiento

    const routerObject = document.getElementById(routerId);
    const table = routerObject.querySelector("table");
    const rows = table.querySelectorAll("tr");

    //reglas de conexion directa

    for (let i = 1; i <= 3; i++) {
        
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        const destinationNetwork = cells[0].innerHTML;
        const destinationNetmask = cells[1].innerHTML;
        
        if (destinationNetwork === getNetwork(destinationIP, destinationNetmask)) { //si la red de destino coincide con la de la ruta aplicandole la misma mascara

            const interface = cells[3].innerHTML;
            const dataSwitchString = "data-switch-" + interface;
            console.log(interface);
            const gateway = cells[2].innerHTML;
            const switchIdentity = routerObject.getAttribute(dataSwitchString);
            const switchObject = document.getElementById(switchIdentity);
            moveObject(routerObject.style.left, routerObject.style.top, switchObject.style.left, switchObject.style.top, "unicast");
            await waitForMove();
            switchResolve(originId, originIP, destinationIP, gateway, routerId, switchIdentity);
            break;
        }

    }

}

async function switchResolve(originId, originIP, destinationIP, gateway, routerId, switchId) {

    const routerObject = document.getElementById(routerId);
    //1) obtenemos la tabla de direcciones fisicas del switch

    const switchObject = document.getElementById(switchId);
    const macElements = switchObject.querySelector("table").querySelectorAll(".mac-address");
    let macs = [];
    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    //2) saturamos los puertos del switch en busca del equipo destino

    for (let i = 0; i < macs.length; i++) {
        const mac = macs[i];
        const pc = document.querySelector(`[data-mac="${mac}"]`);
        if (mac !== routerObject.getAttribute("data-mac")) { //no inunda el puerto de origen
            moveObject(switchObject.style.left, switchObject.style.top, pc.style.left, pc.style.top, "broadcast");
        }
    }

    await waitForMove();

    //4) en cada pc se busca el equipo destino

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];
        const networkObject = document.querySelector(`[data-mac="${mac}"]`);
        const networkObjectId = networkObject.id;
        let ip = "";

        if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("server-")) {

            ip = networkObject.getAttribute("data-ip");

        } else if (networkObjectId.startsWith("router-")) {

            ip = getRouterIp(networkObjectId, switchId);

        }

        if (destinationIP === ip) { // Bingo, hemos encontrado el equipo destino
            moveObject(networkObject.style.left, networkObject.style.top, switchObject.style.left, switchObject.style.top, "unicast");
            await waitForMove();
            return;
        }
    }

}
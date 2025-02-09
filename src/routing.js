async function routing(networkOriginObjectId, networkOriginObjectIp, destinationIP, routerObjectId, visual = false) {

    const routerObject = document.getElementById(routerObjectId); //obtenemos el router
    const routingTable = routerObject.querySelector("table"); //obtenemos la tabla de enrutamiento
    const rows = routingTable.querySelectorAll("tr"); //obtenemos las filas de la tabla

    //reglas de conexion directa

    for (let i = 1; i <=3 ; i++) {

        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ruleNetwork = cells[0].innerHTML;
        let ruleNetmask = cells[1].innerHTML;
        let ruleInterface = cells[3].innerHTML;

        if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) { //le red destino coincide con la red de la regla de conexion directa, solo falta enviar la trama

            const switchId = routerObject.getAttribute("data-switch-" + ruleInterface); 
            const switchObject = document.getElementById(switchId); //obtengo el switch que conecta a la interfaz

            if (visual) {
                movePacket(routerObject.style.left, routerObject.style.top, switchObject.style.left, switchObject.style.top, "unicast");
                await waitForMove();
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
            let ruleInterface = cells[3].innerHTML;

            if (ruleNetwork === getNetwork(destinationIP, ruleNetmask)) { //le red destino coincide con la red de la regla de conexion directa, solo falta enviar la trama

                const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);
                const switchObject = document.getElementById(switchId); //obtengo el switch que conecta a la interfaz

                if (visual) {
                    movePacket(routerObject.style.left, routerObject.style.top, switchObject.style.left, switchObject.style.top, "unicast");
                    await waitForMove();
                }

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
        const switchId = routerObject.getAttribute("data-switch-" + ruleInterface);
        const switchObject = document.getElementById(switchId); //obtengo el switch que conecta a la interfaz

        if (visual) {
            movePacket(routerObject.style.left, routerObject.style.top, switchObject.style.left, switchObject.style.top, "unicast");
            await waitForMove();
        }

        return;
    }

    //se da por fallido

    if (!visual) ping_f(networkOriginObjectIp);
    return;

}
function Routing(routerObjectId, networkObjectOriginId, originIP, destinationIP) {

    const routerObject = document.getElementById(routerObjectId);
    const rules = getRoutingTable(routerObjectId);

    //reglas de conexion directa

    for (let i = 0; i < 2; i++) {

        let rule = rules[i];
        let cells = rule.querySelectorAll("td");
        let destinationNetwork = cells[0].innerHTML;
        let destinationNetmask = cells[1].innerHTML;

        if (destinationNetwork === getNetwork(destinationIP, destinationNetmask)) { //coincide con una regla de conexion directa
            const interface = cells[3].innerHTML;
            const switchObjectId = getSwitchFromRouter(routerObjectId, interface);
            if ( isIpInNetwork(switchObjectId, destinationIP) ) { //el destino está en la red del switch
                ping_s(originIP);
                return;
            }
        }

    }

}

function getSwitchFromRouter(routerObjectId, interface) {

    const routerObject = document.getElementById(routerObjectId);
    const dataSwitchString = "data-switch-" + interface;
    const switchIdentity = routerObject.getAttribute(dataSwitchString);

    return switchIdentity;

}
function routing(originId, originIP, destinationIP, routerId) {

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
            const switchIdentity = routerObject.getAttribute("data-switch-" + interface);
            const switchObject = document.getElementById(switchIdentity);
            moveObject(routerObject.style.left, routerObject.style.top, switchObject.style.left, switchObject.style.top, "unicast");
            return;

        }

    }

}
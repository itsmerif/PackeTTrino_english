/**ESTA FUNCION INSERTA UN REGLA DE CONEXION DIRECTA A LA TABLA DE ENRUTAMIENTO DE UN EQUIPO */
function setDirectRoutingRule(routerObjectId, gateway, netmask, interface) {

    if (!netmask || !gateway || !interface) return;

    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    let found = false;

    $rules.forEach($rule => {

        const $fields = $rule.querySelectorAll("td");

        if ($fields.length === 0) return;

        if ($fields[3].innerHTML === interface && $fields[4].innerHTML === "0.0.0.0") {
            $fields[0].innerHTML = getNetwork(gateway, netmask);
            $fields[1].innerHTML = netmask;
            $fields[2].innerHTML = gateway;
            found = true;
        }

    });

    if (!found) {

        const $defaultRule = $routingTable.querySelector(".default-route");

        let $newRow = document.createElement("tr");

        $newRow.classList.add("direct-route");

        $newRow.innerHTML = `
            <td>${getNetwork(gateway, netmask)}</td>
            <td>${netmask}</td>
            <td>${gateway}</td>
            <td>${interface}</td>
            <td>0.0.0.0</td>
        `;

        if ($defaultRule) $defaultRule.before($newRow)
        else $routingTable.appendChild($newRow);

    }

}

/**ESTA FUNCION INSERTA UN REGLA REMOTA A LA TABLA DE ENRUTAMIENTO DE UN EQUIPO */
function setRemoteRoutingRule(routerObjectId, destination, netmask, gateway, interface, nexthop) {

    if (!destination || !netmask || !gateway || !interface || !nexthop) return;

    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");
    let found = false;

    $routingRules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[0].innerHTML === destination && $fields[1].innerHTML === netmask) {
            found = true;
            $fields[2].innerHTML = (gateway === "0.0.0.0") ? getInfoFromInterface(routerObjectId, interface)[0] : gateway;
            $fields[3].innerHTML = interface;
            $fields[4].innerHTML = nexthop;
        }
    });

    if (!found) {

        const $defaultRule = $routingTable.querySelector(".default-route");

        let $newRow = document.createElement("tr");

        let ruleType = (destination === "0.0.0.0" && netmask === "0.0.0.0") ? "default-route" : "remote-route";

        $newRow.classList.add(ruleType);

        $newRow.innerHTML = `
            <td>${destination}</td>
            <td>${netmask}</td>
            <td>${(gateway === "0.0.0.0") ? getInfoFromInterface(routerObjectId, interface)[0] : gateway}</td>
            <td>${interface}</td>
            <td>${nexthop}</td>
        `;

        if ($defaultRule) $defaultRule.before($newRow)
        else $routingTable.appendChild($newRow);

    }

}

/**ESTA FUNCION ELIMINA UNA REGLA DE CONEXION DIRECTA DE LA TABLA DE ENRUTAMIENTO DE UN EQUIPO */
function removeDirectRoutingRule(routerObjectId, interface) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    $rules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[3].innerHTML === interface && $fields[4].innerHTML === "0.0.0.0") $rule.remove();
    });
}

/**ESTA FUNCION ELIMINA UNA REGLA REMOTA DE LA TABLA DE ENRUTAMIENTO DE UN EQUIPO */
function removeRemoteRoutingRule(routerObjectId, destination, netmask) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    $rules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[4].innerHTML === "0.0.0.0") return;
        if ($fields[0].innerHTML === destination && $fields[1].innerHTML === netmask) $rule.remove();
    });
}

/**ESTA FUNCION IMPRIME EL ENRUTAMIENTO DE UN EQUIPO POR LA TERMINAL*/
function printRouting(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $directRoutingRules = $routingTable.querySelectorAll(".direct-route");
    const $remoteRoutingRules = $routingTable.querySelectorAll(".remote-route");
    const $defaultRoutingRule = $routingTable.querySelector(".default-route");

    if ($defaultRoutingRule) {
        let $defaultfields = $defaultRoutingRule.querySelectorAll("td");
        let defaultInterface = $defaultfields[3].innerHTML;
        let nextHop = $defaultfields[4].innerHTML;
        terminalMessage(`default via ${nextHop} dev ${defaultInterface}`, networkObjectId);
    };

    $remoteRoutingRules.forEach($rule => {
        let $fields = $rule.querySelectorAll("td");
        let destination = $fields[0].innerHTML;
        let netmask = $fields[1].innerHTML;
        let interface = $fields[3].innerHTML;
        let nextHop = $fields[4].innerHTML;
        terminalMessage(`${destination}/${netmaskToCidr(netmask)} via ${nextHop} dev ${interface}`, networkObjectId);
    });

    $directRoutingRules.forEach($rule => {
        let $fields = $rule.querySelectorAll("td");
        let destination = $fields[0].innerHTML;
        let netmask = $fields[1].innerHTML;
        let gateway = $fields[2].innerHTML;
        let interface = $fields[3].innerHTML;
        terminalMessage(`${destination}/${netmaskToCidr(netmask)} dev ${interface} proto kernel scope link src ${gateway}`, networkObjectId);
    });

}

/**ESTA FUNCION RESTAURA LA TABLA DE ENRUTAMIENTO DE UN EQUIPO (DEPRECADA)*/
function routingTableRestore(routerObjectid) {

    const $routerObject = document.getElementById(routerObjectid);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");

    routingTable.innerHTML = `
                <tr>
                    <th>Destination</th>
                    <th>Netmask</th>
                    <th>Gateway</th>
                    <th>Interface</th>
                    <th>Next Hop</th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0 </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0 </td>
                </tr>
                <tr>
                    <td> 0.0.0.0 </td>
                    <td> 0.0.0.0 </td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>`;

}

/**ESTA FUNCION ELIMINA TODAS LAS REGLAS REMOTAS DE LA TABLA DE ENRUTAMIENTO DE UN EQUIPO */
function removeRemoteRules($routerObjectId) {
    const $networkObject = document.getElementById($routerObjectId);
    const $remoteRoutingRules = $networkObject.querySelectorAll(".remote-route");
    $remoteRoutingRules.forEach($rule => $rule.remove());
}

/**ESTA FUNCION DEVUELVE UN NODO TIPO ROW DE LA TABLA DE ENRUTAMIENTO DE UN EQUIPO A PARTIR DEL DESTINO Y MASCARA*/
function getRoutingRule(routerObjectId, destination, netmask) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");
    let response = false;

    for (let i = 1; i < $rows.length; i++) {
        let $row = $rows[i];
        let cells = $row.querySelectorAll("td");
        if (cells.length > 0 && cells[0].innerHTML === destination && cells[1].innerHTML === netmask) response = $row;
    }

    return response;
}

/**ESTA FUNCION DEVUELVE TODAS LAS REGLAS DE ENRUTAMIENTO DE UN EQUIPO COMO ARRAY DE STRINGS A PARTIR DE UNA INTERFAZ*/
function getRoutingRules(routerObjectid, targetinterface) {

    const $routerObject = document.getElementById(routerObjectid);
    const $routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");
    const rules = [];

    for (let i = 4; i < $rows.length; i++) {
        let $row = $rows[i];
        let $cells = $row.querySelectorAll("td");
        let destination = $cells[0].innerHTML.trim();
        let netmask = $cells[1].innerHTML.trim();
        let interface = $cells[3].innerHTML.trim();
        let nextHop = $cells[4].innerHTML.trim();
        if (interface === targetinterface && nextHop !== "0.0.0.0") rules.push(`ip route add ${destination}/${netmaskToCidr(netmask)} via ${nextHop}`);
    }

    return rules;
}
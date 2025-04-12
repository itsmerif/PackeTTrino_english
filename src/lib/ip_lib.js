function addRoutingEntry(routerObjectId, destination, netmask, gateway, interface, nexthop) {

    const $networkObject = document.getElementById(routerObjectId);
    const $table = $networkObject.querySelector(".routing-table").querySelector("table");
    const $defaultRow = $table.querySelector("#default-route");

    destination = destination.trim();
    netmask = netmask.trim();
    gateway = gateway.trim();
    interface = interface.trim();
    nexthop = nexthop.trim();

    if (destination === "" || netmask === "") return;
    
    let $routingRule = getRoutingRule($networkObject.id, destination, netmask);

    if (!$routingRule) {
        
        let $newRow = document.createElement("tr");

        $newRow.innerHTML = `
        <tr>
            <td>${destination}</td>
            <td>${netmask}</td>
            <td>${gateway}</td>
            <td>${interface}</td>
            <td>${nexthop}</td>
        </tr>`;

        $defaultRow.before($newRow);
        terminalMessage("La regla se ha creado correctamente.");

    }else {

        let $cells = $routingRule.querySelectorAll("td");
        $cells[0].innerHTML = destination;
        $cells[1].innerHTML = netmask;
        $cells[2].innerHTML = gateway;
        $cells[3].innerHTML = interface;
        $cells[4].innerHTML = nexthop;

        terminalMessage("La regla ha sido modificada correctamente.");

    }

}

function removeRoutingEntry(routerObjectId, destination, netmask) {
    const networkObject = document.getElementById(routerObjectId);
    const table = networkObject.querySelector(".routing-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 5; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        if (cells[0].innerHTML === destination && cells[1].innerHTML === netmask) {
            row.parentNode.removeChild(row);
            terminalMessage("La regla ha sido eliminada correctamente.");
            return;
        }
    }

    terminalMessage("Error: La regla no existe.");
}

function printRoutingTable(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);

    // caso 1) es un equipo

    if (!networkObjectId.includes("router-")) {
        const ip = $networkObject.getAttribute("ip-enp0s3");
        const netmask = $networkObject.getAttribute("netmask-enp0s3");
        const network = getNetwork(ip, netmask);
        const gateway = $networkObject.getAttribute("data-gateway");
        terminalMessage(`${network}/${netmaskToCidr(netmask)} via ${ip} dev enp0s3`);
        terminalMessage(`default via ${gateway || "-"} dev enp0s3`);
        return;
    }

    // caso 2) es un router

    const table = $networkObject.querySelector(".routing-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let destination = cells[0].innerHTML;
        let netmask = cells[1].innerHTML;
        let gateway = cells[2].innerHTML;
        let interface = cells[3].innerHTML;
        let formattedRoute = "";

        if (destination.trim() === "0.0.0.0" && netmask.trim() === "0.0.0.0") {
            formattedRoute = `default via ${gateway || "-"} dev ${interface || "-"}`;
        } else if (destination !== "") {
            formattedRoute = `${destination}/${netmaskToCidr(netmask)} via ${gateway} dev ${interface}`;
        }

        terminalMessage(formattedRoute);
    }
}

function showObjectInfo(id) {
    const $networkObject = document.getElementById(id);
    const interfaces = getInterfaces(id);
    terminalMessage("1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000");
    terminalMessage("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00");
    terminalMessage("    inet 127.0.0.1/8 scope host lo");
    interfaces.forEach((interface,i) => {
        const ip = $networkObject.getAttribute("ip-" + interface);
        const netmask = $networkObject.getAttribute("netmask-" + interface);
        const mac = $networkObject.getAttribute("mac-" + interface);
        terminalMessage(`${i+1}: enp0s3: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000`);
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
        if (ip) terminalMessage(`    inet ${ip}/${netmaskToCidr(netmask)} brd 192.168.1.255 scope global dynamic ${interface}`);
    });   
}

function configureInterface(networkObjectId, ip, netmask, interface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + interface, ip);
    $networkObject.setAttribute("netmask-" + interface, netmask);
    addRoutingEntry(networkObjectId, getNetwork(ip, netmask), netmask, ip, interface, "0.0.0.0");
    terminalMessage("La red ha sido creada correctamente.");
}

function removeNetwork(networkObjectId, interface) {

    const $networkObject = document.getElementById(networkObjectId);
    const rows = $networkObject.querySelector(".routing-table").querySelector("table").querySelectorAll("tr");

    if (!networkObjectId.includes("router-")) {

        if (interface !== "enp0s3") {
            terminalMessage("Error: La interfaz introducida no es válida.");
            return;
        }

        $networkObject.setAttribute("ip-enp0s3", "");
        $networkObject.setAttribute("netmask-enp0s3", "");

        terminalMessage("La red ha sido eliminada correctamente.");
        return;
    }

    $networkObject.setAttribute("ip-" + interface, "");
    $networkObject.setAttribute("netmask-" + interface, "");

    //ahora actualizamos la tabla de enrutamiento

    if (interface === "enp0s3") {
        let targetRow = rows[1];
        let cells = targetRow.querySelectorAll("td");
        cells[0].innerHTML = "";
        cells[1].innerHTML = "";
        cells[2].innerHTML = "";
        cells[3].innerHTML = "";
    }

    if (interface === "enp0s8") {
        let targetRow = rows[2];
        let cells = targetRow.querySelectorAll("td");
        cells[0].innerHTML = "";
        cells[1].innerHTML = "";
        cells[2].innerHTML = "";
        cells[3].innerHTML = "";
    }

    if (interface === "enp0s9") {
        let targetRow = rows[3];
        let cells = targetRow.querySelectorAll("td");
        cells[0].innerHTML = "";
        cells[1].innerHTML = "";
        cells[2].innerHTML = "";
        cells[3].innerHTML = "";
    }

    terminalMessage("La red ha sido eliminada correctamente.");

}

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

function removeRemotesRules(routerObjectId) {

    const $routerObject = document.getElementById(routerObjectId);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    //restauramos la regla por defecto

    let defaultRule = rows[4];
    let cells = defaultRule.querySelectorAll("td");
    cells[0].innerHTML = "0.0.0.0";
    cells[1].innerHTML = "0.0.0.0";
    cells[2].innerHTML = "";
    cells[3].innerHTML = "";
    cells[4].innerHTML = "";

    Array.from(rows).slice(5).forEach(row => row.remove());

    terminalMessage("El enrutamiento ha sido restaurado correctamente.");

}

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
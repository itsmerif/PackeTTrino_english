function command_Ip(id, args) {

    if (args[1] === "addr" || args[1] === "a") {

        if (args.length === 2) {
            showObjectInfo(id);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 7) {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]');
                return;
            }

            if (args[2] !== "add" && args[2] !== "del") {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]');
                return;
            }

            if (!isValidIp(args[3])) {
                terminalMessage("Error: La IP introducida no es válida.");
                return;
            }

            if (!isValidIp(args[4])) {
                terminalMessage("Error: La máscara de red introducida no es válida.");
                return;
            }

            if (args[5] !== "dev") {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]');
                return;
            }

            if (args[6] !== "enp0s3" && args[6] !== "enp0s8" && args[6] !== "enp0s9") {
                terminalMessage("Error: La interfaz introducida no es válida.");
                return;
            }

            addNetwork(id, args[3], args[4], args[6]);
            return;
        }

        if (args[2] === "del") {

            if (args.length !== 4) {
                terminalMessage('Error de argumentos. Sintaxis: ip addr del [interface]');
                return;
            }

            if (args[3] !== "enp0s3" && args[3] !== "enp0s8" && args[3] !== "enp0s9") {
                terminalMessage("Error: La interfaz introducida no es válida.");
                return;
            }

            removeNetwork(id, args[3]);
            return;
        }

    }

    if (args[1] === "route" || args[1] === "r") { 

        if (args.length === 2) {
            printRoutingTable(id);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 8) {
                terminalMessage('Error de argumentos. Sintaxis: ip route [add|del] [destination] [netmask] via [interface] [nexthop]');
                return;
            }
    
            if (args[2] !== "add" && ( args[2] !== "del" || args[5] !== "via")) {
                terminalMessage('Error de argumentos. Sintaxis: ip route [add|del] [destination] [netmask] via [interface] [nexthop]');
                return;
            }

            addRoutingEntry(id, args[3], args[4], args[6], args[7]);
            return;
        }

        if (args[2] === "del") {

            if (args.length !== 5) {
                terminalMessage('Error de argumentos. Sintaxis: ip route del [destination] [netmask]');
                return;
            }

            removeRoutingEntry(id, args[3], args[4]);
            return;
        }
    }

    terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');

}

function addRoutingEntry(routerObjectId, destination, netmask, interface, nexthop) {

    const networkObject = document.getElementById(routerObjectId);
    const table = networkObject.querySelector(".routing-table").querySelector("table");

    if (destination !== "0.0.0.0") { //añadimos una nueva regla

        const gateway = networkObject.getAttribute("ip-" + interface);

        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La red de destino introducida no es válida.");
            return;
        }

        if (!netmask.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La máscara de red introducida no es válida.");
            return;
        }

        if (!nexthop.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La IP de siguiente salto introducida no es válida.");
            return;
        }

        if (!gateway) {
            terminalMessage("Error: Interfaz " + interface + " no configurada.");
            return;
        }

        if (getNetwork(gateway, netmask) !== getNetwork(nexthop, netmask)) {
            terminalMessage("Error: La IP de siguiente salto no es accesible.");
            return;
        }

        //primero comprobamos si la regla ya existe

        let rows = table.querySelectorAll("tr");

        if (rows.length > 4) {
            for (let i = 5; i < rows.length; i++) {
                let row = rows[i];
                let cells = row.querySelectorAll("td");
                if (destination === cells[0].innerHTML && netmask === cells[1].innerHTML) { //bingo, la regla ya existe
                    cells[2].innerHTML = gateway;
                    cells[3].innerHTML = interface;
                    cells[4].innerHTML = nexthop;
                    return;
                }
            }
        }

        //si no existe, añadimos una nueva regla

        let newRow = document.createElement("tr");

        newRow.innerHTML = `
            <tr>
                <td>${destination}</td>
                <td>${netmask}</td>
                <td>${gateway}</td>
                <td>${interface}</td>
                <td>${nexthop}</td>
            </tr>`;
        table.appendChild(newRow);

        terminalMessage("La regla ha sido creada correctamente.");

    } else { //editamos la regla por defecto

        const rows = table.querySelectorAll("tr");
        const defaultRule = rows[4];
        const cells = defaultRule.querySelectorAll("td");
        const gateway = networkObject.getAttribute("ip-" + interface);

        if (netmask !== "0.0.0.0") {
            terminalMessage("Error: No se puede cambiar la máscara de red de la regla por defecto.");
            return;
        }

        if (!gateway) {
            terminalMessage("Error: Interfaz " + interface + " no configurada.");
            return;
        }

        if (getNetwork(gateway, netmask) !== getNetwork(nexthop, netmask)) {
            terminalMessage("Error: La IP de siguiente salto no es accesible.");
            return;
        }

        cells[2].innerHTML = gateway;
        cells[3].innerHTML = interface;
        cells[4].innerHTML = nexthop;

        terminalMessage("La regla por defecto ha sido modificada correctamente.");

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
        const ip = $networkObject.getAttribute("data-ip");
        const netmask = $networkObject.getAttribute("data-netmask");
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

        console.log(destination, netmask, gateway, interface);

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

    if (!id.includes("router-")) {

        const ip = $networkObject.getAttribute("data-ip");
        const netmask = $networkObject.getAttribute("data-netmask");
        const mac = $networkObject.getAttribute("data-mac");

        terminalMessage("1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000");
        terminalMessage("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00");
        terminalMessage("    inet 127.0.0.1/8 scope host lo");
        terminalMessage("2: enp0s3: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000");
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
        if (ip) terminalMessage(`    inet ${ip}/${netmaskToCidr(netmask)} brd 192.168.1.255 scope global dynamic enp0s3`);
        return;

    }

    if (id.includes("router-")) {

        const ipEnp0s3 = $networkObject.getAttribute("ip-enp0s3");
        const ipEnp0s8 = $networkObject.getAttribute("ip-enp0s8");
        const ipEnp0s9 = $networkObject.getAttribute("ip-enp0s9");
        const netmaskEnp0s3 = $networkObject.getAttribute("netmask-enp0s3");
        const netmaskEnp0s8 = $networkObject.getAttribute("netmask-enp0s8");
        const netmaskEnp0s9 = $networkObject.getAttribute("netmask-enp0s9");
        const mac = $networkObject.getAttribute("data-mac");

        terminalMessage("1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000");
        terminalMessage("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00");
        terminalMessage("    inet 127.0.0.1/8 scope host lo");
        terminalMessage("2: enp0s3: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000");
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
        if (ipEnp0s3) terminalMessage(`    inet ${ipEnp0s3}/${netmaskToCidr(netmaskEnp0s3)} brd ${getBroadcastIp(ipEnp0s3, netmaskEnp0s3)} scope global dynamic enp0s3`);
        terminalMessage("3: enp0s8: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000");
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
        if (ipEnp0s8) terminalMessage(`    inet ${ipEnp0s8}/${netmaskToCidr(netmaskEnp0s8)} brd ${getBroadcastIp(ipEnp0s8, netmaskEnp0s8)} scope global dynamic enp0s8`);
        terminalMessage("4: enp0s9: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000");
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`);
        if (ipEnp0s9) terminalMessage(`    inet ${ipEnp0s9}/${netmaskToCidr(netmaskEnp0s9)} brd ${getBroadcastIp(ipEnp0s9, netmaskEnp0s9)} scope global dynamic enp0s9`);

        return;
    }

}

function addNetwork(networkObjectId, ip, netmask, interface) {

    const $networkObject = document.getElementById(networkObjectId);

    // caso 1) es un equipo

    if (!networkObjectId.includes("router-")) {

        if (interface !== "enp0s3") {
            terminalMessage("Error: La interfaz introducida no es válida.");
            return;
        }

        $networkObject.setAttribute("data-ip", ip);
        $networkObject.setAttribute("data-netmask", netmask);
        terminalMessage("La red ha sido creada correctamente.");
        return;
    }

    // caso 2) es un router

    const rows = $networkObject.querySelector(".routing-table").querySelector("table").querySelectorAll("tr");
    $networkObject.setAttribute("ip-" + interface, ip);
    $networkObject.setAttribute("netmask-" + interface, netmask);

    //ahora actualizamos la tabla de enrutamiento

    if (interface === "enp0s3") {
        let targetRow = rows[1];
        let cells = targetRow.querySelectorAll("td");
        cells[0].innerHTML = getNetwork(ip, netmask);
        cells[1].innerHTML = netmask;
        cells[2].innerHTML = ip;
        cells[3].innerHTML = interface;
    }

    if (interface === "enp0s8") {
        let targetRow = rows[2];
        let cells = targetRow.querySelectorAll("td");
        cells[0].innerHTML = getNetwork(ip, netmask);
        cells[1].innerHTML = netmask;
        cells[2].innerHTML = ip;
        cells[3].innerHTML = interface;
    }

    if (interface === "enp0s9") {
        let targetRow = rows[3];
        let cells = targetRow.querySelectorAll("td");
        cells[0].innerHTML = getNetwork(ip, netmask);
        cells[1].innerHTML = netmask;
        cells[2].innerHTML = ip;
        cells[3].innerHTML = interface;
    }

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

        $networkObject.setAttribute("data-ip", "");
        $networkObject.setAttribute("data-netmask", "");

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
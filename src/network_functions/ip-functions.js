function command_Ip(id, args) {

    if (args[1] === "a") { //mostramos la informacion del equipo, solo puede ser ejecutado desde un pc

        if (id.includes("router-")) {
            return "Error: Este comando solo puede ser ejecutado desde un pc.";
        }

        const pc = document.getElementById(id);
        const ip = pc.getAttribute("data-ip");
        const netmask = pc.getAttribute("data-netmask");
        const gateway = pc.getAttribute("data-gateway");
        const mac = pc.getAttribute("data-mac");

        terminalMessage(`Dirección IP: ${ip}`);
        terminalMessage(`Puerta de Enlace: ${gateway}`);
        terminalMessage(`Máscara de Red: ${netmask}`);
        terminalMessage(`Dirección Física: ${mac}`);

        return;
    }

    if (args[1] === "route") { //añadir reglas de enrutamiento, solo puede ser ejecutado desde un router

        if (!id.includes("router-")) {
            terminalMessage('Error: Este comando solo puede ser ejecutado desde un router.');
            return;
        }

        if (args.length < 8) {
            terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');
            return;
        }

        if (args[2] !== "add" && args[2] !== "del" || args[5] !== "via") {
            terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');
            return;
        }

        if (args[2] === "add") {
            addRoutingEntry(id, args[3], args[4], args[6], args[7]);
            terminalMessage('Comando ip route ejecutado correctamente');
            return;
        }

        if (args[2] === "del") {
            removeRoutingEntry(id, args[3], args[4], args[6], args[7]);
            terminalMessage('Comando ip route ejecutado correctamente');
            return;
        }
    }

    terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');

}

function addRoutingEntry(routerObjectId, destination, netmask, interface, nexthop) {

    const networkObject = document.getElementById(routerObjectId);
    const table = networkObject.querySelector(".routing-table").querySelector("table");

    if (destination !== "0.0.0.0") { //añadimos una nueva regla

        const newRow = document.createElement("tr");
        const gateway = networkObject.getAttribute("ip-" + interface);
        newRow.innerHTML = `
            <tr>
                <td>${destination}</td>
                <td>${netmask}</td>
                <td>${gateway}</td>
                <td>${interface}</td>
                <td>${nexthop}</td>
            </tr>`;
        table.appendChild(newRow);

    } else { //editamos la regla por defecto

        const rows = table.querySelectorAll("tr");
        const defaultRule = rows[4];
        const cells = defaultRule.querySelectorAll("td");
        const gateway = networkObject.getAttribute("ip-" + interface);
        cells[2].innerHTML = gateway;
        cells[3].innerHTML = interface;
        cells[4].innerHTML = nexthop;

    }

}

function removeRoutingEntry(routerObjectId, destination, netmask, nexthop) {

    const networkObject = document.getElementById(routerObjectId);
    const table = networkObject.querySelector(".routing-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        if (cells[0].innerHTML === destination && cells[1].innerHTML === netmask) {
            table.removeChild(row);
        }
    }

}
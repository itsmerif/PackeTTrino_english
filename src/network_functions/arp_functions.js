function command_arp(dataId, args) {

    const $networkObject = document.getElementById(dataId);

    if (args[1] === "-s" || args[1] === "--show") {
        terminalMessage($networkObject.querySelector(".arp-table").querySelector("table").outerHTML);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {
        $networkObject.querySelector(".arp-table").querySelector("table").innerHTML = `
                <tr>
                    <th>IP Address</th>
                    <th>MAC Address</th>
                </tr>`;
        terminalMessage("La tabla ARP ha sido limpiada correctamente.");
        return;
    }

    terminalMessage("Error: Sintaxis: arp &lt;-n&gt; ");

}

function getARPTable(networkObjectId) {

    let tabla = document.getElementById(networkObjectId).querySelector(".arp-table").querySelector("table");
    let matriz = [];

    for (let fila of tabla.rows) {
        let filaArray = [];
        for (let celda of fila.cells) {
            filaArray.push(celda.innerText.trim());
        }
        matriz.push(filaArray);
    }

    return matriz;

}

function addARPEntry(networkObjectId, ip, mac) {

    let tabla = document.getElementById(networkObjectId).querySelector(".arp-table").querySelector("table");
    let rows = tabla.querySelectorAll("tr");
    let found = false;

    for (let i = 1; i < rows.length; i++) {

        let row = rows[i]; 
        let cells = row.querySelectorAll("td");
        let targetip = cells[0].innerText.trim();
        let targetMac = cells[1].innerText.trim();

        if (targetip === ip) {
            targetMac = mac;
            found = true;
            break;
        }

    }

    if (!found) {
        let newRow = tabla.insertRow();
        newRow.insertCell().innerText = ip;
        newRow.insertCell().innerText = mac;
    }

}

function delARPEntry(networkObjectId, targetip) {
    let tabla = document.getElementById(networkObjectId).querySelector(".arp-table").querySelector("table");
    let rows = tabla.querySelectorAll("tr");
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ip = cells[0].innerText.trim();
        if (ip === targetip) {
            row.remove();
        }
    }
}

function isIpInARPTable(networkObjectId, ipAddress) {

    const arpTable = getARPTable(networkObjectId);

    for (let i = 0; i < arpTable.length; i++) {
        const arpRow = arpTable[i];
        const mac = arpRow[1];
        const ip = arpRow[0];

        if (ip === ipAddress) {
            return mac;
        }
    }

    return false;

}

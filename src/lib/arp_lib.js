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
            break;
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

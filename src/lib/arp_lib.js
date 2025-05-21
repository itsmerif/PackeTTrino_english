/**ESTA FUNCIOÓN DEVUELVE LA TABLA DE ARP DE UN OBJETO DE RED COMO ARRAY DE ARRAYS*/
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

/**ESTA FUNCIÓN AÑADE UNA ENTRADA A LA TABLA DE ARP DE UN OBJETO DE RED*/
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

/**ESTA FUNCIÓN ELIMINA UNA ENTRADA DE LA TABLA DE ARP DE UN OBJETO DE RED*/
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

/**ESTA FUNCIÓN DEVUELVE LA DIRECCIÓN MAC DE UNA IP EN LA TABLA DE ARP DE UN OBJETO DE RED*/
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

/**ESTA FUNCIÓN DEVUELVE EL HTML DE LA TABLA DE ARP DE UN OBJETO DE RED*/
function getcurrentARPTable(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    return $networkObject.querySelector(".arp-table").querySelector("table").outerHTML;
}

/**ESTA FUNCIÓN ELIMINA TODAS LAS ENTRADAS DE LA TABLA DE ARP DE UN OBJETO DE RED*/
function clearARPTable(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $arpTable = $networkObject.querySelector(".arp-table").querySelector("table");
    const $entries = $arpTable.querySelectorAll("tr");
    for (let i = 1; i < $entries.length; i++) $entries[i].remove();
}
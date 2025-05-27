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

    const $arpTable = document.getElementById(networkObjectId).querySelector(".arp-table").querySelector("table");
    const $records = $arpTable.querySelectorAll("tr");
    let found = false;

    for (let i = 1; i < $records.length; i++) {

        const $record = $records[i]; 
        const $fields = $record.querySelectorAll("td");
        const $recordIp = $fields[0];
        const $recordMac = $fields[1];

        if ($recordIp.innerText.trim() === ip) {
            $recordMac.innerText = mac;
            found = true;
            break;
        }

    }

    if (!found) {
        
        const newRow = $arpTable.insertRow();
        newRow.insertCell().innerText = ip;
        newRow.insertCell().innerText = mac;
        
        console.log(`Se ha añadido el registro ARP de ${ip} a ${networkObjectId} durante ${$ARPENTRYTTL * 1000} MS`);
        
        arpEntryTimers[`${networkObjectId}-${ip}`] = setTimeout(() => { 
            console.log(`Se ha agotado el registro ARP de ${ip} IN ${networkObjectId}`);
            delARPEntry(networkObjectId, ip);
        }, $ARPENTRYTTL * 1000);

    }

}

/**ESTA FUNCIÓN ELIMINA UNA ENTRADA DE LA TABLA DE ARP DE UN OBJETO DE RED*/
function delARPEntry(networkObjectId, ip) {

    const $arpTable = document.getElementById(networkObjectId).querySelector(".arp-table").querySelector("table");
    const $records = $arpTable.querySelectorAll("tr");

    for (let i = 1; i < $records.length; i++) {

        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        const recordIp = $fields[0].innerText.trim();

        if (recordIp === ip) {
            clearTimeout(arpEntryTimers[`${networkObjectId}-${ip}`]);
            delete arpEntryTimers[`${networkObjectId}-${ip}`];
            $record.remove();
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

    for (let i = 1; i < $entries.length; i++) {
        const $entry = $entries[i];
        const $fields = $entry.querySelectorAll("td");
        const entryIp = $fields[0].innerText.trim();
        clearTimeout(arpEntryTimers[`${networkObjectId}-${entryIp}`]);
        delete arpEntryTimers[`${networkObjectId}-${entryIp}`];
        $entries[i].remove();
    }
    
}
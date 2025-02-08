function getNetwork(ip, netmask) {

    ip = ip.split('.'); //separamos cada octeto de la ip
    netmask = netmask.split('.'); //separamos cada octeto de la netmask
    let network = [];
    for (let i = 0; i < 4; i++) {
        network[i] = ip[i] & netmask[i]; //aplicamos el AND entre cada octeto de la ip y la netmask
    }
    return network.join('.'); //juntamos los resultados 
}

function getRandomMac() {
    //genero los 48 bits aleatorios
    let macString = "";
    for (let i = 1; i <= 48; i++) {
        macString += Math.floor(Math.random() * 2);
    }
    //separamos los bloques de 8 bits
    let macBlocks = macString.match(/.{1,8}/g) || [];
    //transformamos cada bloque en hexadecimal
    for (let i = 0; i < macBlocks.length; i++) {
        macBlocks[i] = (parseInt(macBlocks[i], 2).toString(16)).padStart(2, '0');
    }
    //unimos los bloques en una cadena
    let mac = macBlocks.join(':');
    return mac;
}

function getARPTable(networkObjectId) {

    let tabla = document.getElementById(networkObjectId).querySelector("table");
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

function getMACTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");

    let macs = [];

    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    return macs;

}

function addARPEntry(networkObjectId, ip, mac) {

    let tabla = document.getElementById(networkObjectId).querySelector("table");
    let newRow = tabla.insertRow();
    newRow.insertCell().innerText = ip;
    newRow.insertCell().innerText = mac;

}

function addRoutingEntry(routerObjectId, destination, netmask, nexthop) {

    const networkObject = document.getElementById(routerObjectId);
    const table = networkObject.querySelector("table");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <tr>
            <td>${destination}</td>
            <td>${netmask}</td>
            <td> - </td>
            <td>${nexthop}</td>
        </tr>`;
    table.appendChild(newRow);

}

function removeRoutingEntry(routerObjectId, destination, netmask, nexthop) {

    const networkObject = document.getElementById(routerObjectId);
    const table = networkObject.querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");

        if (cells[0].innerHTML === destination && cells[1].innerHTML === netmask && cells[2].innerHTML === nexthop) {
            table.removeChild(row);
        }
    }

}

function isMacTableEmpty(switchObjectId) {

    let tabla = document.getElementById(switchObjectId).querySelector("table");
    let matriz = [];

    for (let fila of tabla.rows) {
        let filaArray = [];
        for (let celda of fila.cells) {
            filaArray.push(celda.innerText.trim());
        }
        matriz.push(filaArray);
    }

    if (matriz.length === 1) {
        return true;
    }else {
        return false;
    }

}

function getRouterIp(routerObjectId, switchObjectId) {
    
    const router = document.getElementById(routerObjectId);
    let ip = "";

    if (router.getAttribute("data-switch-enp0s3") === switchObjectId) {

        ip = router.getAttribute("ip-enp0s3");

    } else if (router.getAttribute("data-switch-enp0s8") === switchObjectId) {

        ip = router.getAttribute("ip-enp0s8");

    } else if (router.getAttribute("data-switch-enp0s9") === switchObjectId) {

        ip = router.getAttribute("ip-enp0s9");
        
    }

    return ip;

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

function isMacInMACTable(switchObjectId, macAddress) {

    const macs = getMACTable(switchObjectId);

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];

        if (mac === macAddress) {
            return true;
        }

    }
    
    return false;

}

function isIpInNetwork(switchObjectId, ipAddress) {

    const macs = getMACTable(switchObjectId); //obtengo la tabla de macs de ese switch

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];
        const networkObject = document.querySelector(`[data-mac="${mac}"]`);
        const networkObjectId = networkObject.id;

        if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("server-")) {

            const networkObjectIp = networkObject.getAttribute("data-ip");

            if (networkObjectIp === ipAddress) {

                return mac;

            }

        } else if (networkObjectId.startsWith("router-")) {

            const networkObjectIp = getRouterIp(networkObjectId, switchObjectId);

            if (networkObjectIp === ipAddress) {

                return mac;

            }

        }
        
    }

    return false;
}

function broadcastSwitch(switchObjectId, macToExclude) {

    const macs = getMACTable(switchObjectId);
    const switchOriginObject = document.getElementById(switchObjectId);

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];

        const networkObject = document.querySelector(`[data-mac="${mac}"]`);

        if (mac !== macToExclude) { //no inunda el puerto de origen

            moveObject(switchOriginObject.style.left, switchOriginObject.style.top, networkObject.style.left, networkObject.style.top, "broadcast");

        }
    }

}
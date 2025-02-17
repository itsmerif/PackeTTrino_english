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

function ipToBinary(ip) {

    let blocks = ip.split(".");
    let blocksBinary = [];

    for (let i = 0; i<blocks.length; i++) {
        blocksBinary[i] = parseInt(blocks[i]).toString(2).padStart(8,"0");
    }

    let ipBinary = blocksBinary.join('')

    return ipBinary
}

function binaryToIp(binary) {

    let blocks = binary.match(/.{8}/g);
    let blocksIp = [];

    for (let i=0; i<blocks.length; i++) {
        blocksIp[i] = parseInt(blocks[i],2).toString(10)
    }

    let ip = blocksIp.join(".")

    return ip
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

function getRoutingTable(routerObjectId) {

    const routerObject = document.getElementById(routerObjectId);
    const table = routerObject.querySelector(".routing-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    return Array.from(rows).slice(1);

}

function ipCheck(switchObjectId,networkObjectId, ip) {

    const networkObject = document.getElementById(networkObjectId);
    let networkObjectIp = "";

    if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("server-")) {
        networkObjectIp = networkObject.getAttribute("data-ip");
    }
    if (networkObjectId.startsWith("router-")) {
        networkObjectIp = getRouterIp(networkObjectId, switchObjectId);
    }

    if (networkObjectIp === ip) {
        return true;
    }

    return false;

}

function getDeviceFromMac(switchObjectId, mac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[1].innerHTML === mac) {
            return cells[0].innerHTML;
        }

    }
}

function macCheck( networkObjectId, mac )  {

    const networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = networkObject.getAttribute("data-mac");
    
    if (networkObjectMac === mac) {
        return true;
    }

    return false;
    
}

function isMacinNetwork(switchObjectId, mac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];
        const cells = row.querySelectorAll("td");
        const networkObjectId = cells[0].innerHTML; //dispositivo conectado

        if (macCheck(networkObjectId, mac)) { // si la mac que le enviamos coincide con la que tiene el dispositivo, este nos envia una confirmacion

            return networkObjectId;

        }

    }

    return false;
}

function getDeviceTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const devices = switchOriginObject.querySelector("table").querySelectorAll(".device-name");

    let devicesArray = [];

    for (let i = 0; i < devices.length; i++) {
        devicesArray.push(devices[i].innerHTML);
    }

    return devicesArray; 

}

function isIpInNetwork(switchObjectId, ipAddress) {

    const devices = getDeviceTable(switchObjectId);

    for (let i = 0; i < devices.length; i++) {

        const networkObject = document.getElementById(devices[i]);
        const mac = networkObject.getAttribute("data-mac");
        let ip = "";

        if (devices[i].startsWith("pc-") || devices[i].startsWith("server-")) {
            ip = networkObject.getAttribute("data-ip");
        }

        if (devices[i].startsWith("router-")) {
            ip = getRouterIp(devices[i], switchObjectId);
        }

        if (ip === ipAddress) {
            return [ devices[i], mac ];
        }

    }

    return false;
}

async function broadcastSwitch(switchObjectId, excludeId) {

    const switchObject = document.getElementById(switchObjectId);
    const devices = getDeviceTable(switchObjectId);

    for (let i = 0; i < devices.length; i++) {

        if (devices[i] !== excludeId) {

            const networkObject = document.getElementById(devices[i]);
            const x = networkObject.style.left;
            const y = networkObject.style.top;
            movePacket(switchObject.style.left, switchObject.style.top, x, y, "broadcast");
        
        }
    }

}

function isDHCPinNetwork(switchObjectId) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        const networkObjectId = cells[0].innerHTML; //dispositivo conectado

        if (networkObjectId.startsWith("server-dhcp-relay-")) { //devolvemos el id identificandolo como agente de retransmision
            return [networkObjectId, "relay"];
        }

        if (networkObjectId.startsWith("server-")) { //devolvemos el id identificandolo como servidor
            return [networkObjectId, "server"];
        }

    }
    
    return false;

}
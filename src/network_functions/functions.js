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

    if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("dhcp-server-")) {
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

        if (devices[i].startsWith("pc-") || devices[i].startsWith("dhcp-server-")) {
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

        if (networkObjectId.startsWith("dhcp-relay-server-")) { //devolvemos el id identificandolo como agente de retransmision
            return [networkObjectId, "relay"];
        }

        if (networkObjectId.startsWith("dhcp-server-")) { //devolvemos el id identificandolo como servidor
            return [networkObjectId, "server"];
        }

    }
    
    return false;

}

function getRandomIpfromDhcp(serverObjectId) {

    // Obtengo el servidor
    const serverObject = document.getElementById(serverObjectId);

    // Obtengo el rango de IPs que ofrece
    const rangeStart = serverObject.getAttribute("data-range-start"); // 192.168.1.100
    const rangeEnd = serverObject.getAttribute("data-range-end");     // 192.168.1.200

    // Convertimos las IPs de rango a binario
    let rangeStartBinary = ipToBinary(rangeStart);
    let rangeEndBinary = ipToBinary(rangeEnd);

    // Convertimos binario a número entero para facilitar el cálculo
    let startInt = parseInt(rangeStartBinary, 2);
    let endInt = parseInt(rangeEndBinary, 2);

    // Generamos una IP aleatoria dentro del rango

    let randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
    let randomBinary = randomInt.toString(2).padStart(32, '0');
    let randomIp = binaryToIp(randomBinary);

    while (!checkIpinDhcp(serverObjectId, randomIp)) { //si no esta disponible, volvemos a obtener una aleatoria
        randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
        randomBinary = randomInt.toString(2).padStart(32, '0');
        randomIp = binaryToIp(randomBinary);
    }

    return randomIp;

}

function checkIpinDhcp(serverObjectId, newip) {

    const serverObject = document.getElementById(serverObjectId); //obtengo el server
    const dhcpTable = serverObject.querySelector(".dhcp-table").querySelector("table");
    const rows = dhcpTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        let row = rows[i]; //fila
        let cells = row.querySelectorAll("td");
        let ip = cells[0]

        if (newip === ip) {
            return false
        }

    }

    return true

}

function addDhcpEntry(serverObjectId, newip, newmac, newhostname) {

    const serverObject = document.getElementById(serverObjectId);
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <tr>
            <td>${newip}</td>
            <td>${newmac}</td>
            <td>${newhostname}</td>
            <td>3600</td>
        </tr>`;
    table.appendChild(newRow);

}

function setDhcpInfo(networkObjectId, packet) {
    const $networkObject = document.getElementById(networkObjectId);
    let newIp = packet.yiaddr;
    let newGateway = packet.gateway;
    let newNetmask = packet.netmask;
    $networkObject.setAttribute("data-ip", newIp);
    $networkObject.setAttribute("data-gateway", newGateway);
    $networkObject.setAttribute("data-netmask", newNetmask);
}
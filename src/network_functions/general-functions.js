function getNetwork(ip, netmask) {

    ip = ip.split('.'); //separamos cada octeto de la ip
    netmask = netmask.split('.'); //separamos cada octeto de la netmask
    let network = [];
    for (let i = 0; i < 4; i++) {
        network[i] = ip[i] & netmask[i]; //aplicamos el AND entre cada octeto de la ip y la netmask
    }
    return network.join('.'); //juntamos los resultados 
}

function getBroadcastIp(ip, netmask) {
    let ipBinary = (ip.split('.').map(octet => parseInt(octet, 10).toString(2).padStart(8, '0'))).join('');
    let netmaskCidr = netmaskToCidr(netmask);
    let broadcast = (ipBinary.slice(0, netmaskCidr).padEnd(32, '1').match(/.{8}/g) || []).map(octet => parseInt(octet, 2).toString(10)).join('.');
    return broadcast;
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

function netmaskToCidr(netmask) {

    let octets = netmask.split("."); //separamos por octetos

    for (let i = 0; i < octets.length; i++) {
        octets[i] = parseInt(octets[i]).toString(2).padStart(8, "0");
    }

    let cidr = octets.join("").split("0")[0].length;

    return cidr;

}

function parseCidr(cidr) {  //192.168.0.0/24
    let ip = cidr.split("/")[0]; //192.168.0.0
    let netmask = parseInt(cidr.split("/")[1]); //24
    let dummy = "";
    for (let i = 1; i <= netmask; i++) {
        dummy += "1"; //"11111111....1"
    }
    dummy = dummy.padEnd(32, "0"); //"1111111..100....0"
    let dummy_octets = dummy.match(/.{8}/g) || []; //["11111111", ...,  "100....0"]
    for (let i = 0; i < dummy_octets.length; i++) {
        dummy_octets[i] = parseInt(dummy_octets[i], 2).toString(10); //[255, 255, ..., 0]
    }
    let netmaskBinary = dummy_octets.join(".")

    return [ip, netmaskBinary];
}

function isValidIp(ip) {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip);
}

function isValidCidrIp(cidr) {
    let ip = cidr.split("/")[0];
    let netmask = cidr.split("/")[1];

    if (!isValidIp(ip)) {
        return false;
    }

    let netmaskInt = parseInt(netmask);
    
    if (isNaN(netmaskInt) || netmaskInt < 0 || netmaskInt > 32) {
        return false;
    }

    return true;
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

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}
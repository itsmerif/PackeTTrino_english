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

    for (let i = 0; i < blocks.length; i++) {
        blocksBinary[i] = parseInt(blocks[i]).toString(2).padStart(8, "0");
    }

    let ipBinary = blocksBinary.join('')

    return ipBinary
}

function binaryToIp(binary) {

    let blocks = binary.match(/.{8}/g);
    let blocksIp = [];

    for (let i = 0; i < blocks.length; i++) {
        blocksIp[i] = parseInt(blocks[i], 2).toString(10)
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

function isValidDomain(domain) {
    return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])\.?$/.test(domain);
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
    } else {
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

function ipCheck(switchObjectId, networkObjectId, ip) {

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

function macCheck(networkObjectId, mac) {

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
            return [devices[i], mac];
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

function getopts(options, string) {

    options = options.replace(/ /g, "");

    if (options.charAt(0) !== ":") {
        throw new Error("Error de sintaxis");
    }

    let optionsObject = {};

    for (let i = 0; i < options.length; i++) {
        if (options.charAt(i) !== ":") optionsObject["-" + options.charAt(i)] = (options.charAt(i + 1) === ":") ? "value" : "novalue";
    }

    string = string.split(" ");

    response = {};

    for (let i = 0; i < string.length; i++) {
        if (optionsObject[string[i]]) {
            response[string[i]] = "";
            if (optionsObject[string[i]] === "value") {
                response[string[i]] = string[i + 1];
                i++;
            }
        } else {
            throw new Error("Opcion no reconocida");
        }
    }

    return response;
}

function catchopts(options, string) {

    let optionsObject = {};

    for (let i = 0; i < options.length; i++) {
        if (options[i].endsWith(":")) {
            optionsObject["-" + options[i].slice(0, -1)] = "value";
        } else {
            optionsObject["-" + options[i]] = "novalue";
        }
    }

    string = string.trim().split(" ");

    response = {};

    for (let i = 0; i < string.length; i++) {
        if (optionsObject[string[i]]) {
            response[string[i]] = "";
            if (optionsObject[string[i]] === "value") {
                response[string[i]] = string[i + 1];
                i++;
            }
        } else {
            throw new Error("Opcion no reconocida");
        }
    }

    return response;
}

function createBasicNetwork() {
    createRouterObject(500, 400);
    setRouterIps(getLastElement(".router"), "192.168.1.1/24", "193.168.1.1/24", "172.16.1.1/24");
    createSwitchObject(300, 550);
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createPcObject(200, 700);
    createDhcpRelayObject(100, 600);
    createConn(getLastElement(".dhcp-relay"), getLastElement(".switch"));
    createConn(getLastElement(".pc"), getLastElement(".switch"));
    createSwitchObject(300, 300);
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createDhcpServerObject(100, 300);
    createConn(getLastElement(".dhcp-server"), getLastElement(".switch"));
    createSwitchObject(700, 300);
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createRouterObject(600, 150);
    setRouterIps(getLastElement(".router"), "172.16.1.2/24", "194.168.1.1/24");
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createSwitchObject(900, 150);
    createPcObject(1100, 125);
    createConn(getLastElement(".pc"), getLastElement(".switch"));
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createRouterObject(1000, 300);
    setRouterIps(getLastElement(".router"), "192.168.1.1/24", "193.168.1.1/24", "172.16.1.1/24");
    createConn(getLastElement(".router"), getLastElement(".switch", -2));
    createRouterObject(700, 500);
    setRouterIps(getLastElement(".router"), "192.168.1.1/24", "193.168.1.1/24", "172.16.1.1/24");
    createConn(getLastElement(".router"), getLastElement(".switch", -2));
    createSwitchObject(600, 600);
    createPcObject(550, 725);
    createConn(getLastElement(".pc"), getLastElement(".switch"));
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createSwitchObject(1200, 225);
    createConn(getLastElement(".router", -2), getLastElement(".switch"));
    createSwitchObject(1000, 500);
    createConn(getLastElement(".router", -2), getLastElement(".switch"));
    createRouterObject(1400, 225);
    setRouterIps(getLastElement(".router"), "192.168.1.1/24", "193.168.1.1/24", "172.16.1.1/24");
    createConn(getLastElement(".router"), getLastElement(".switch", -2));
    createSwitchObject(1600, 225);
    createPcObject(1750, 180);
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createConn(getLastElement(".pc"), getLastElement(".switch"));
    createRouterObject(1200, 550);
    setRouterIps(getLastElement(".router"), "192.168.1.1/24", "193.168.1.1/24", "172.16.1.1/24");
    createConn(getLastElement(".router"), getLastElement(".switch", -2));
    createSwitchObject(1400, 450);
    createSwitchObject(1400, 650);
    createDnsServerObject(1600, 450);
    createDnsServerObject(1600, 650);
    createConn(getLastElement(".router"), getLastElement(".switch"));
    createConn(getLastElement(".router"), getLastElement(".switch", -2));
    createConn(getLastElement(".dns-server"), getLastElement(".switch"));
    createConn(getLastElement(".dns-server", -2), getLastElement(".switch", -2));
    //anotaciones de texto
    createTextObject(150, 475);
    getLastElement(".text-annotation").querySelector("input").value = "192.168.1.0/24";
    createTextObject(200, 225);
    getLastElement(".text-annotation").querySelector("input").value = "193.168.1.0/24";
    createTextObject(450, 275);
    getLastElement(".text-annotation").querySelector("input").value = "172.16.1.0/16";
    createTextObject(800, 75);
    getLastElement(".text-annotation").querySelector("input").value = "194.168.1.0/24";
    createTextObject(450, 500);
    getLastElement(".text-annotation").querySelector("input").value = "10.0.0.0/8";
    createTextObject(1175, 150);
    getLastElement(".text-annotation").querySelector("input").value = "194.168.1.0/24";
    createTextObject(1500, 150);
    getLastElement(".text-annotation").querySelector("input").value = "12.0.0.0/8";
    createTextObject(800, 500);
    getLastElement(".text-annotation").querySelector("input").value = "13.0.0.0/8";
    createTextObject(1300, 350);
    getLastElement(".text-annotation").querySelector("input").value = "1.0.0.0/8";
    createTextObject(1300, 700);
    getLastElement(".text-annotation").querySelector("input").value = "8.0.0.0/8";
}

function getLastElement(selector, position = -1) {
    const elements = document.querySelectorAll(selector);
    return elements[elements.length + position];
}

function createConn(elementoOrigen, elementoDestino) {

    const dragstartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    const dataTransfer = new DataTransfer();

    Object.defineProperty(dragstartEvent, 'dataTransfer', {
        value: dataTransfer,
        writable: false
    });

    elementoOrigen.dispatchEvent(dragstartEvent);

    const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        view: window,
        dataTransfer: dataTransfer
    });

    elementoDestino.dispatchEvent(dropEvent);

    return {
        originElement: elementoOrigen,
        targetElement: elementoDestino,
        dataTransfer: dataTransfer
    };
}

function setRouterIps($router, ip1, ip2 = "", ip3 = "") {

    let [newIpEnp0s3, newNetmaskEnp0s3] = parseCidr(ip1);
    let [newIpEnp0s8, newNetmaskEnp0s8] = parseCidr(ip2);
    let [newIpEnp0s9, newNetmaskEnp0s9] = parseCidr(ip3);

    $router.setAttribute("ip-enp0s3", newIpEnp0s3);
    $router.setAttribute("ip-enp0s8", newIpEnp0s8);
    $router.setAttribute("ip-enp0s9", newIpEnp0s9);
    $router.setAttribute("netmask-enp0s3", newNetmaskEnp0s3);
    $router.setAttribute("netmask-enp0s8", newNetmaskEnp0s8);
    $router.setAttribute("netmask-enp0s9", newNetmaskEnp0s9);

    const routingTable = $router.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    const interfaces = [
        { ip: newIpEnp0s3, netmask: newNetmaskEnp0s3, interface: "enp0s3" },
        { ip: newIpEnp0s8, netmask: newNetmaskEnp0s8, interface: "enp0s8" },
        { ip: newIpEnp0s9, netmask: newNetmaskEnp0s9, interface: "enp0s9" }
    ];

    interfaces.forEach((iface, index) => {
        const row = rows[index + 1];
        const cells = row.querySelectorAll("td");
        if (getNetwork(iface.ip, iface.netmask) !== "0.0.0.0") cells[0].innerHTML = getNetwork(iface.ip, iface.netmask);
        cells[1].innerHTML = iface.netmask;
        cells[2].innerHTML = iface.ip;
        cells[3].innerHTML = iface.interface;
    });

}
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
    let ipBinary = (ip.split('.').map(octet => parseInt(octet, 10).toargs(2).padStart(8, '0'))).join('');
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
    let netmask = parseInt(cidr.split("/")[1]);
    let response = true;
    if (!isValidIp(ip)) response = false;
    if (isNaN(netmask) || netmask < 0 || netmask > 32) response = false;
    return response;
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
        networkObjectIp = networkObject.getAttribute("ip-enp0s3");
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
    const networkObjectMac = networkObject.getAttribute("mac-enp0s3");

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
        const mac = networkObject.getAttribute("mac-enp0s3");
        let ip = "";

        if (devices[i].startsWith("pc-") || devices[i].startsWith("dhcp-server-")) {
            ip = networkObject.getAttribute("ip-enp0s3");
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

function catchopts(options, args) {

    let optionsObject = {};

    for (let i = 0; i < options.length; i++) {
        if (options[i].endsWith(":")) {
            optionsObject[options[i].slice(0, -1)] = "value";
        } else {
            optionsObject[options[i]] = "novalue";
        }
    }

    response = {};
    response["IND"] = 0;

    for (let i = 1; i < args.length; i++) { //me salto el primer elemento, que es el comando
        if (optionsObject[args[i]]) {
            response["IND"] = i;
            response[args[i]] = "";
            if (optionsObject[args[i]] === "value") {
                response[args[i]] = args[i + 1];
                i++;
                response["IND"] = i;
            }
        } else {
            break;
        }
    }

    return response;
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
/**ESTA FUNCION DEVUELVA LAS INTERFACES DE UN DISPOSITIVO COMO ARRAY [INTERFAZ1, INTERFAZ2, ...] */
function getInterfaces(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let response = [];
    let index = 3;
    let networkInterface = $networkObject.getAttribute("ip-enp0s" + index);

    while (networkInterface !== null) {
        response.push(`enp0s` + index);
        if (index === 3) index = 8;
        else index++;
        networkInterface = $networkObject.getAttribute("ip-enp0s" + index);
    }

    return response;

}

function isConnected(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchAttribute = $networkObject.getAttribute("data-switch-enp0s" + index);

    while (switchAttribute !== null) {
        if (switchAttribute !== "") return true;
        if (index === 3) index = 8;
        else index++;
        switchAttribute = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    if (networkObjectId.startsWith("switch-")) return getDeviceTable(networkObjectId).length !== 0;

    return false;

}

function getAvailableInterface(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);

    while (switchConn !== null) {
        if (switchConn === "") return `enp0s${index}`;
        if (index === 3) index = 8;
        else index++;
        switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    return false;
}

function getInterfaceInfo(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    let response = [];

    while (switchConn !== null) {

        if (switchConn === switchObjectId) {
            response.push($networkObject.getAttribute("ip-enp0s" + index));
            response.push($networkObject.getAttribute("netmask-enp0s" + index));
            response.push($networkObject.getAttribute("mac-enp0s" + index));
            return response;
        }

        if (index === 3) index = 8;
        else index++;
        switchConn = $networkObject.getAttribute("data-switch-enp0s" + index);
    }

    return [false, false, false];

}

function getAvailableIps(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    let availableIps = [];

    while (networkObjectIp !== null) {
        if (networkObjectIp !== "") availableIps.push(networkObjectIp);
        if (index === 3) index = 8;
        else index++;
        networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    }

    return availableIps;

}

function getReachableInterface(networkObjectId, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    let networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s" + index);

    while (networkObjectIp !== null && networkObjectNetmask !== null) {
        if (networkObjectIp !== "" && networkObjectNetmask !== "" && getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(ip, networkObjectNetmask)) return `enp0s${index}`;
        if (index === 3) index = 8;
        else index++;
        networkObjectIp = $networkObject.getAttribute("ip-enp0s" + index);
    }

    return false;
}

function restoreNetworkConfiguration(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let ip = $networkObject.getAttribute("ip-enp0s" + index);
    let netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    while (ip !== null && netmask !== null) {
        $networkObject.setAttribute("ip-enp0s" + index, "");
        $networkObject.setAttribute("netmask-enp0s" + index, "");
        if (index === 3) index = 8;
        else index++;
        ip = $networkObject.getAttribute("ip-enp0s" + index);
        netmask = $networkObject.getAttribute("netmask-enp0s" + index);
    }

}

function showObjectInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    terminalMessage("1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000", networkObjectId);
    terminalMessage("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00", networkObjectId);
    terminalMessage("    inet 127.0.0.1/8 scope host lo", networkObjectId);
    interfaces.forEach((interface, i) => {
        const ip = $networkObject.getAttribute("ip-" + interface);
        const netmask = $networkObject.getAttribute("netmask-" + interface);
        const mac = $networkObject.getAttribute("mac-" + interface);
        terminalMessage(`${i + 1}: enp0s3: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000`, networkObjectId);
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`, networkObjectId);
        if (ip) terminalMessage(`    inet ${ip}/${netmaskToCidr(netmask)} brd 192.168.1.255 scope global dynamic ${interface}`, networkObjectId);
    });
}

function configureInterface(networkObjectId, ip, netmask, interface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + interface, ip);
    $networkObject.setAttribute("netmask-" + interface, netmask);
    if (networkObjectId.startsWith("router-")) addRoutingEntry(networkObjectId, getNetwork(ip, netmask), netmask, ip, interface, "0.0.0.0");
}

function deconfigureInterface(networkObjectId, interface) {
    const $networkObject = document.getElementById(networkObjectId);
    const ip = $networkObject.getAttribute("ip-" + interface);
    const netmask = $networkObject.getAttribute("netmask-" + interface);
    $networkObject.removeAttribute("ip-" + interface);
    $networkObject.removeAttribute("netmask-" + interface);
    if (networkObjectId.startsWith("router-")) removeRoutingEntry(networkObjectId, getNetwork(ip, netmask), netmask);
}

/**ESTA FUNCION DEVUELVE LA INFORMACION DE UNA INTERFAZ COMO ARRAY [INTERFAZ, SWITCH AL QUE ESTÁ CONECTADA, DIRECCIÓN MAC ]*/

function getInfoFromIp(networkObjectId, ip) {

    const $networkObject = document.getElementById(networkObjectId);
    let response = [false,false,false];
    let index = 3;
    let interfaceIp = $networkObject.getAttribute("ip-enp0s" + index);

    while (interfaceIp !== null) {

        if (interfaceIp === ip) {
            response[0] = `enp0s${index}`;
            response[1] = $networkObject.getAttribute("data-switch-enp0s" + index);
            response[2] = $networkObject.getAttribute("mac-enp0s" + index);
        }

        if (index === 3) index = 8;
        else index++;

        interfaceIp = $networkObject.getAttribute("ip-enp0s" + index);

    }

    return response;

}


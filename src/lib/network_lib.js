/**ESTA FUNCION GENERA UNA DIRECCION MAC ALEATORIA */
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

/**ESTA FUNCION DEVUELVE UNA DIRECCION IP A PARTIR DE UN IP Y UN NETMASK */
function getNetwork(ip, netmask) {

    ip = ip.split('.'); //separamos cada octeto de la ip
    netmask = netmask.split('.'); //separamos cada octeto de la netmask
    let network = [];
    for (let i = 0; i < 4; i++) {
        network[i] = ip[i] & netmask[i]; //aplicamos el AND entre cada octeto de la ip y la netmask
    }
    return network.join('.'); //juntamos los resultados 
}

/**ESTA FUNCION DEVUELVE LA DIRECCION IP DE BROADCAST DE UN IP Y UN NETMASK */

function getBroadcast(ip, netmask) {
    return binaryToIp((ipToBinary(ip)).slice(0, ipToBinary(netmask).split("0")[0].length).padEnd(32, "1"))
}

/**ESTA FUNCION TRANSFORMA UNA IP(DECIMAL) A IP(BINARIO) */
function ipToBinary(ip) {

    let blocks = ip.split(".");
    let blocksBinary = [];

    for (let i = 0; i < blocks.length; i++) {
        blocksBinary[i] = parseInt(blocks[i]).toString(2).padStart(8, "0");
    }

    let ipBinary = blocksBinary.join('')

    return ipBinary
}

/**ESTA FUNCION TRANSFORMA UNA IP(BINARIO) A IP(DECIMAL) */
function binaryToIp(binary) {

    let blocks = binary.match(/.{8}/g);
    let blocksIp = [];

    for (let i = 0; i < blocks.length; i++) {
        blocksIp[i] = parseInt(blocks[i], 2).toString(10)
    }

    let ip = blocksIp.join(".")

    return ip
}

/**ESTA FUNCION TRANSFORMA UNA MASCARA A SU NOTACION CIDR SIN '/' */
function netmaskToCidr(netmask) {

    let octets = netmask.split("."); //separamos por octetos

    for (let i = 0; i < octets.length; i++) {
        octets[i] = parseInt(octets[i]).toString(2).padStart(8, "0");
    }

    let cidr = octets.join("").split("0")[0].length;

    return cidr;

}

/**ESTA FUNCION DEVUELVE UNA IP Y NETMASK A PARTIR DE UNA DIRECCION IP EN NOTACION CIDR */
function parseCidr(cidr) { 
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

/**ESTA FUNCION DEVUELVE TRUE SI LA IP ES VALIDA */
function isValidIp(ip) {
    return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip);
}

/**ESTA FUNCION AÑADE UNA ENTRADA A LA TABLA DE MACS DE UN SWITCH*/
function saveMac(switchObjectId, networkObjectId, newMac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[0].innerHTML === networkObjectId) {
            cells[1].innerHTML = newMac;
            break;
        }
    }
    
}

/**ESTA FUNCION ELIMINA UNA ENTRADA DE LA TABLA DE MACS DE UN SWITCH*/
function deleteMacEntry(switchId, networkObjectId) {
    const switchObject = document.getElementById(switchId);
    const table = switchObject.querySelector("table");
    const tds = table.querySelectorAll("td");

    for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.innerHTML === networkObjectId) {
            const tr = td.parentElement; 
            tr.remove(); 
            break;
        }
    }
}

/**ESTA FUNCION DEVUELVE TRUE SI LA DIRECCION IP EN NOTACION CIDR ES VALIDA. TAMBIEN VALIDA SI LA DIRECCION IP ES VALIDA */
function isValidCidrIp(cidr) {
    let ip = cidr.split("/")[0];
    let netmask = parseInt(cidr.split("/")[1]);
    let response = true;
    if (!isValidIp(ip)) response = false;
    if (isNaN(netmask) || netmask < 0 || netmask > 32) response = false;
    return response;
}

/**ESTA FUNCION DEVUELVE TRUE SI EL DOMINIO ES VALIDO */
function isValidDomain(domain) {
    return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])\.?$/.test(domain);
}

/**ESTA FUNCION DEVUELVE TRUE SI LA MAC ES VALIDA */
function isValidMac(mac) {
    return /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

/**ESTA FUNCION LAS MACS ALMACENADAS EN UN SWITCH COMO ARRAY*/
function getMACTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");

    let macs = [];

    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    return macs;

}

/**ESTA FUNCION DEVUELVE TRUE SI LA TABLA DE DIRECCIONES MACS DE UN SWITCH ESTA VACIA */
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

/**ESTA FUNCION DEVUELVE TRUE SI UNA DIRECCION MAC ESTA ALMACENADA EN UN SWITCH */
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

/**ESTA FUNCION DEVUELVE EL DISPOSITIVO (PUERTO) QUE CORRESPONDE CON UNA DIRECCION MAC EN UN SWITCH */
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

/**ESTA FUNCION DEVUELVE LA TABLA DE DISPOSITIVOS (PUERTOS) ACTIVOS EN UN SWITCH */
function getDeviceTable(switchObjectId) {

    const switchOriginObject = document.getElementById(switchObjectId);

    const devices = switchOriginObject.querySelector("table").querySelectorAll(".device-name");

    let devicesArray = [];

    for (let i = 0; i < devices.length; i++) {
        devicesArray.push(devices[i].innerHTML);
    }

    return devicesArray;

}

/**ESTA FUNCION ESCAPEA EL HTML DE UN STRING */
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}

/**ESTA FUNCION ACTUA COMO GETOPTS DE LINUX. DEVUELVE UN OBJECTO CON LAS OPCIONES VALIDAS COMO KEY Y EL VALOR */
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

/**ESTA FUNCION DEVUELVE LAS INTERFACES DE UN DISPOSITIVO COMO ARRAY [INTERFAZ1, INTERFAZ2, ...] */
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

/**ESTA FUNCION DEVUELVE TRUE SI EL DISPOSITIVO TIENE AL MENOS 1 CONEXION ACTIVA */
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

/**ESTA FUNCION DEVUELVE LA PRIMERA INTERFAZ LIBRE DEL DISPOSITIVO */
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

/**ESTA FUNCION DEVUELVE LA INFORMACION DE UNA INTERFAZ COMO ARRAY [IP, NETMASK, MAC] */
function getInfoFromInterface(networkObjectId, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    return [$networkObject.getAttribute("ip-" + iface), $networkObject.getAttribute("netmask-" + iface), $networkObject.getAttribute("mac-" + iface)];
}

/**ESTA FUNCION DEVUELVE LA INFORMACION DE UNA INTERFAZ QUE ESTE CONECTADA A UN SWITCH EN CONCRETO */
function getInterfaceSwitchInfo(networkObjectId, switchObjectId) {

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

/**ESTA FUNCION DEVUELVE LA INTERFAZ DE UN DISPOSITIVO QUE ESTÁ CONECTADA A UN SWITCH */
function switchToInterface(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    let response = false;
    interfaces.forEach(iface => { if ($networkObject.getAttribute(`data-switch-${iface}`) === switchId) response = iface; });
    return response;
}

/**ESTA FUNCION DEVUELVE LAS IPS DISPONIBLES EN UN DISPOSITIVO COMO ARRAY [IP1, IP2, ...] */
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

/**ESTA FUNCION DEVUELVE UN ARRAY CON LAS DIRECCIONES MAC DE TODAS LAS INTERFAZ DE UN DISPOSITIVO */
function getMacAddresses(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let index = 3;
    let mac = $networkObject.getAttribute("mac-enp0s" + index);
    let macs = [];

    while (mac !== null) {
        macs.push(mac);
        if (index === 3) index = 8;
        else index++;
        mac = $networkObject.getAttribute("mac-enp0s" + index);
    }

    return macs;

}

/**ESTA FUNCIÓN DEVUELVE TRUE SI LA IP ES LOCAL PARA EL DISPOSITIVO */
function isLocalIp(networkObjectId, ip)  {

    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    let response = false;

    //si forma parte de alguna interfaz
    for (let iface of interfaces) if ($networkObject.getAttribute(`ip-${iface}`) === ip) response = true;

    //si forma parte del bucle local
    if (getNetwork(ip,"255.0.0.0") === "127.0.0.0") response = true;

    return response;
}

//FUNCIONES DE SIMULACION DE CONSTRUCCION DE REDES
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

    const ifaces = [
        { ip: newIpEnp0s3, netmask: newNetmaskEnp0s3, interface: "enp0s3" },
        { ip: newIpEnp0s8, netmask: newNetmaskEnp0s8, interface: "enp0s8" },
        { ip: newIpEnp0s9, netmask: newNetmaskEnp0s9, interface: "enp0s9" }
    ];

    ifaces.forEach((iface, index) => {
        const row = rows[index + 1];
        const cells = row.querySelectorAll("td");
        if (getNetwork(iface.ip, iface.netmask) !== "0.0.0.0") cells[0].innerHTML = getNetwork(iface.ip, iface.netmask);
        cells[1].innerHTML = iface.netmask;
        cells[2].innerHTML = iface.ip;
        cells[3].innerHTML = iface.interface;
    });

}

/**ESTA FUNCION PARSEA UNA DIRECCIÓN DE BÚSQUEDA EN [PROTOCOLO, IP, PUERTO] */
function parseSearch(input) {
    
    let protocol;
    let addressPortResource;
    let addressPort;
    let address;
    let port;
    let resource;

    //definimos los mapas

    const protocolMap = {
        http: 80,
        https: 443,
        ptt: 80
    };

    //
    const dividebyProtocol = splitFirst(input, "://");

    if (dividebyProtocol.length < 2) {
        protocol = "http";
        addressPortResource = dividebyProtocol[0];
    }else {
        protocol = dividebyProtocol[0];
        addressPortResource = dividebyProtocol[1];
    }

    const dividebyResource = splitFirst(addressPortResource, "/");

    if (dividebyResource.length < 2) {
        addressPort = dividebyResource[0];
        resource = "";
    }else {
        addressPort = dividebyResource[0];
        resource = dividebyResource[1];
    }

    const dividebyAddressPort = splitFirst(addressPort, ":");
    
    if (dividebyAddressPort.length < 2) {
        address = dividebyAddressPort[0];
        port = protocolMap[protocol];
    }else {
        address = dividebyAddressPort[0];
        port = parseInt(dividebyAddressPort[1]);
    }
    
    return {
        protocol: protocol,
        address: address,
        port: port,
        resource: resource
    }

}
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


function getARPTable(id) {

    let tabla = document.getElementById(id).querySelector("table");
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

function addARPEntry(id, ip, mac) {

    let tabla = document.getElementById(id).querySelector("table");
    let newRow = tabla.insertRow();
    newRow.insertCell().innerText = ip;
    newRow.insertCell().innerText = mac;

}

function addRoutingEntry(id, destination, netmask, nexthop) {

    const networkObject = document.getElementById(id);
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

function removeRoutingEntry(id, destination, netmask, nexthop) {

    const networkObject = document.getElementById(id);
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

function isMacTableEmpty(id) {

    let tabla = document.getElementById(id).querySelector("table");
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


function getRouterIp(routerId, switchId) {
    console.log(routerId, switchId);
    const router = document.getElementById(routerId);
    let ip = "";

    if (router.getAttribute("data-switch-enp0s3") === switchId) {
        ip = router.getAttribute("ip-enp0s3");
    } else if (router.getAttribute("data-switch-enp0s8") === switchId) {
        ip = router.getAttribute("ip-enp0s8");
    } else if (router.getAttribute("data-switch-enp0s9") === switchId) {
        ip = router.getAttribute("ip-enp0s9");
    }

    return ip;

}
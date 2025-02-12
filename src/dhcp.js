async function dhcp(networkObjectId, visual = false) {

    const networkObject = document.getElementById(networkObjectId); //obtenemos el elemento

    if (networkObject.getAttribute("data-dhcp") === "false") {
        if (!visual) ping_f("0.0.0.0");
        return;
    }

    const switchObjectId = networkObject.getAttribute("data-switch"); //obtenemos el id del switch al que está conectado
    const switchObject = document.getElementById(switchObjectId); //obtenemos el switch

    //primero el equipo realiza un broadcast con DHCPDISCOVER

    if (visual) {
        movePacket(networkObject.style.left, networkObject.style.top, switchObject.style.left, switchObject.style.top, "discover");
        await waitForMove();
        broadcastSwitch(switchObjectId, networkObjectId); //broadcast del switch a todos los dispositivos conectados excepto el origen
        await waitForMove();
    }

    if (!isDHCPinNetwork(switchObjectId)) { //no hay un servidor DHCP en la red
        if (!visual) ping_f("0.0.0.0");
        return;
    }

    const serverObjectId = isDHCPinNetwork(switchObjectId); //obtenemos el id del servidor DHCP
    const serverObject = document.getElementById(serverObjectId); //obtenemos el servidor DHCP

    if (visual) { //el server envia por broadcast DHCPOFFER
        movePacket(serverObject.style.left, serverObject.style.top, switchObject.style.left, switchObject.style.top, "offer");
        await waitForMove();
        broadcastSwitch(switchObjectId, serverObjectId); //broadcast del switch a todos los dispositivos conectados excepto el origen
        await waitForMove();
        //el equipo responde con DHCPREQUEST
        movePacket(networkObject.style.left, networkObject.style.top, switchObject.style.left, switchObject.style.top, "request");
        await waitForMove();
        broadcastSwitch(switchObjectId, networkObjectId); //broadcast del switch a todos los dispositivos conectados excepto el origen
        await waitForMove();
        //el servidor responde con DHCPACK
        movePacket(serverObject.style.left, serverObject.style.top, switchObject.style.left, switchObject.style.top, "ack");
        await waitForMove();
        movePacket(switchObject.style.left, switchObject.style.top, networkObject.style.left, networkObject.style.top, "ack");
        await waitForMove();
    }
    
    //realizamos todos los procesos

    const newIp = getRandomIpfromDhcp(serverObject.id);
    addDhcpEntry(serverObject.id, newIp, networkObject.getAttribute("data-mac"), networkObject.id); //añadimos la entrada a la tabla dhcp
    addARPEntry(networkObject.id, serverObject.getAttribute("data-ip"), serverObject.getAttribute("data-mac")); //añadimos la ip y mac al equipo origen
    addARPEntry(serverObject.id, newIp, networkObject.getAttribute("data-mac")); //añadimos la ip y mac al equipo destino
    networkObject.setAttribute("data-ip", newIp);
    networkObject.setAttribute("data-netmask", serverObject.getAttribute("data-netmask"));
    networkObject.setAttribute("data-network", serverObject.getAttribute("data-network"));
    networkObject.setAttribute("data-gateway", serverObject.getAttribute("data-gateway"));

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
    
    for (let i=1; i<rows.length; i++) {

        let row = rows[i]; //fila
        let cells = row.querySelectorAll("td");
        let ip = cells[0]

        if (newip === ip ){
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
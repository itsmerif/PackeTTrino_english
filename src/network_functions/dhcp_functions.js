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
    const dataInterval = serverObject.getAttribute("data-interval");

    newRow.innerHTML = `
        <td>${newip}</td>
        <td>${newmac}</td>
        <td>${newhostname}</td>
        <td class="lease-time">10</td>`;
    table.appendChild(newRow);

    if (dataInterval === "false") {
        setInterval(() => updateLeaseTime(serverObjectId), 1000);
        serverObject.setAttribute("data-interval", "true");
    }
}

function updateLeaseTime(serverObjectId) {
    const $serverObject = document.getElementById(serverObjectId);
    const table = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const leases = table.querySelectorAll(".lease-time");

    leases.forEach(lease => {
        let time = parseInt(lease.innerHTML, 10);
        if (time > 0) {
            lease.innerHTML = time - 1;
        }
        if (time === 0) {
            let row = lease.parentNode;
            let cells = row.querySelectorAll("td");
            let ip = cells[0].innerHTML;
            row.remove();
            renewLeaseTime(ip);
        }
    });
}

function deleteDhcpEntry(serverObjectId, targetip) {
    const serverObject = document.getElementById(serverObjectId);
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ip = cells[0].innerHTML;
        if (ip === targetip) {
            row.remove();
            return;
        }
    }
}

function setDhcpInfo(networkObjectId, packet) {
    const $networkObject = document.getElementById(networkObjectId);
    let newIp = packet.yiaddr;
    let newGateway = packet.gateway;
    let newNetmask = packet.netmask;
    let newServer = packet.siaddr;
    $networkObject.setAttribute("data-ip", newIp);
    $networkObject.setAttribute("data-gateway", newGateway);
    $networkObject.setAttribute("data-netmask", newNetmask);
    $networkObject.setAttribute("data-dhcp-server", newServer);
}

function deleteDhcpInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("data-ip", "");
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-netmask", "");
    $networkObject.setAttribute("data-dhcp-server", "");
}

function renewLeaseTime(ip) {
    const $networkObject = document.querySelector(`[data-ip='${ip}']`);
    const networkObjectId = $networkObject.id;
    const switchId = $networkObject.getAttribute("data-switch");
    const isDHCPon = $networkObject.getAttribute("data-dhcp");
    if (isDHCPon === "false") return;
    console.log("Emitiendo DHCP Renew...");
    dhcpRenewGenerator(networkObjectId, switchId);
}

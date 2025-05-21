/**ESTA FUNCION DEVUELVE UNA IP ALEATORIA VÁLIDA DENTRO DEL RANGO DE IPS DE SERVICIO DE UN SERVIDOR DHCP PARA UNA OFERTA */
function getRandomIPfromDhcp(serverObjectId) {

    const $serverObject = document.getElementById(serverObjectId);
    const rangeStart = $serverObject.getAttribute("data-range-start");

    const rangeEnd = $serverObject.getAttribute("data-range-end");
    const offerNetmask = $serverObject.getAttribute("offer-netmask");

    let startInt = parseInt(ipToBinary(rangeStart), 2);
    let endInt = parseInt(ipToBinary(rangeEnd), 2);
    let randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
    let randomBinary = randomInt.toString(2).padStart(32, '0');
    let randomIp = binaryToIp(randomBinary);

    if (!rangeStart || !rangeEnd || !offerNetmask) return randomIp;

    while (!checkIpinDhcp(serverObjectId, randomIp)) {
        randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
        randomBinary = randomInt.toString(2).padStart(32, '0');
        randomIp = binaryToIp(randomBinary);
    }

    return randomIp;

}

/**ESTA FUNCION DEVUELVE TRUE SI LA IP ES VÁLIDA PARA OFERTA DE UN SERVIDOR DHCP */
function checkIpinDhcp(serverObjectId, newip) {

    const $serverObject = document.getElementById(serverObjectId);
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $reservations = JSON.parse($serverObject.getAttribute("ip-reservations"));
    const $leases = $leasesTable.querySelectorAll("tr");
    let response = true;

    $leases.forEach(lease => {
        let $fields = lease.querySelectorAll("td");
        if ($fields.length < 1) return;
        if ($fields[0].innerHTML === newip) response = false;
    });

    for (let reservation in $reservations) {
        if ($reservations[reservation] === newip) response = false;
    }

    return response;

}

/**ESTA FUNCION AÑADE UNA NUEVA ENTRADA DE ALQUILER A LA BASE DE DATOS DE UN SERVIDOR DHCP */
function addDhcpEntry(serverObjectId, newip, newmac, newhostname) {

    const $serverObject = document.getElementById(serverObjectId);
    const leaseTime = $serverObject.getAttribute("offer-lease-time");
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $newLease = document.createElement("tr");

    $newLease.innerHTML = `
        <td>${newip}</td>
        <td>${newmac}</td>
        <td>${newhostname}</td>
        <td class="lease-time">${leaseTime}</td>
    `;

    $leasesTable.appendChild($newLease);
    if (!serverLeaseTimers[serverObjectId]) serverLeaseTimers[serverObjectId] = setInterval(() => updateServerLeaseTimes(serverObjectId), 1000);
}

/**ESTA FUNCION ELIMINA UNA ENTRADA DE ALQUILER DE UN SERVIDOR DHCP */
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
            if (table.querySelectorAll("tr").length === 1) { // Solo queda la cabecera
                clearInterval(window.leaseTimer);
                serverObject.setAttribute("data-interval", "false");
            }
            return;
        }
    }
}

/**ESTA FUNCION ACTUALIZA EL TIEMPO DE ALQUILER DE LOS ALQUILERES DE UN SERVIDOR DHCP */
function updateDhcpEntry(serverObjectId, renewPacket) {

    const $serverObject = document.getElementById(serverObjectId);
    const leaseTimeOffer = $serverObject.getAttribute("offer-lease-time");
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $leases = $leasesTable.querySelectorAll("tr");
    let response = false;

    $leases.forEach( $lease => {

        let $fields = $lease.querySelectorAll("td");

        if ($fields.length < 1) return;
         
        let mac = $fields[1].innerHTML;

        if (mac === renewPacket.chaddr) {
            $fields[0].innerHTML = renewPacket.ciaddr;
            $fields[2].innerHTML = renewPacket.hostname;
            $fields[3].innerHTML = leaseTimeOffer
            response = true;
        }

    });

    return response;

}

/**ESTA FUNCION INICIA DE NUEVO LA ACTUALIZACION DE LOS TIEMPOS DE ALQUILER DE LOS ALQUILERES DE UN SERVIDOR DHCP */
function startLeaseTimers() {

    const $dhcpServers = Array.from(document.querySelectorAll(".item-dropped")).filter($networkObject => $networkObject.getAttribute("dhcpd") !== null);
    const $dhcpClients = Array.from(document.querySelectorAll(".item-dropped")).filter($networkObject => $networkObject.getAttribute("dhclient") !== null);

    $dhcpServers.forEach(server => {
        const serverObjectId = server.id;
        const table = server.querySelector(".dhcp-table table");
        const leases = table.querySelectorAll("tr");
        if (leases.length > 1 && !serverLeaseTimers[serverObjectId]) {
            serverLeaseTimers[serverObjectId] = setInterval(() => updateServerLeaseTimes(serverObjectId), 1000);
        }
    });

    $dhcpClients.forEach(client => {
        const clientObjectId = client.id;
        const leaseTime = client.getAttribute("data-dhcp-lease-time");
        if (leaseTime !== "" && !clientLeaseTimers[clientObjectId]) {
            clientLeaseTimers[clientObjectId] = setInterval( async () => { await reduceClientLeaseTime(clientObjectId)}, 1000 );
        }
    });

}

/**ESTA FUNCION AÑADE UNA NUEVA RESERVA DE ALQUILER A LA BASE DE DATOS DE UN SERVIDOR DHCP */
function addDhcpReservation(networkObjectId, mac, ip) {
    const $networkObject = document.getElementById(networkObjectId);
    const reservations = JSON.parse($networkObject.getAttribute("ip-reservations"));
    if (!isValidIp(ip)) throw new Error("Error: La IP introducida no es valida.");
    if (!isValidMac(mac)) throw new Error("Error: La MAC introducida no es valida.");
    reservations[mac] = ip;
    $networkObject.setAttribute("ip-reservations", JSON.stringify(reservations));
}

/**ESTA FUNCION ELIMINA UNA RESERVA DE ALQUILER DE LA BASE DE DATOS DE UN SERVIDOR DHCP */
function removeDhcpReservation(networkObjectId, mac) {
    const $networkObject = document.getElementById(networkObjectId);
    const reservations = JSON.parse($networkObject.getAttribute("ip-reservations"));
    delete reservations[mac];
    $networkObject.setAttribute("ip-reservations", JSON.stringify(reservations));
}

/**ESTA FUNCION DEVUELVE LA IP RESERVADA DE UN DISPOSITIVO PARA UNA DIRECCION MAC */
function getReservedIp(serverObjectId, mac) {
    const $serverObject = document.getElementById(serverObjectId);
    const reservations = JSON.parse($serverObject.getAttribute("ip-reservations"));
    let filteredMac = mac.trim().toUpperCase();
    if (reservations[filteredMac]) return reservations[filteredMac];
    return false;
}
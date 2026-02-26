/**ESTA FUNCION DEVUELVE UNA IP ALEATORIA VÁLIDA DENTRO DEL RANGO DE IPS DE SERVICIO DE UN SERVIDOR DHCP PARA UNA OFERTA */
function getRandomIPfromDhcp(serverObjectId) {

    const $serverObject = document.getElementById(serverObjectId);
    const rangeStart = $serverObject.getAttribute("data-range-start");

    const rangeEnd = $serverObject.getAttribute("data-range-end");
    const offerNetmask = $serverObject.getAttribute("dhcp-offer-netmask");

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
    const $reservations = JSON.parse($serverObject.getAttribute("dhcp-reservations"));
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
    const leaseTime = $serverObject.getAttribute("dhcp-offer-lease-time");
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
    const leaseTimeOffer = $serverObject.getAttribute("dhcp-offer-lease-time");
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

/**ESTA FUNCION INICIA/REINICIA EL TIEMPO DE ALQUILER DHCP DE UN EQUIPO*/
async function updateClientLeaseTimer(networkObjectId, iface) {

    const $networkObject = document.getElementById(networkObjectId);

    $networkObject.setAttribute(`data-dhcp-current-lease-time-${iface}`, 0);
    $networkObject.setAttribute(`data-dhcp-flag-t1-${iface}`, "false");
    $networkObject.setAttribute(`data-dhcp-flag-t2-${iface}`, "false");

    if (Object.hasOwn(clientLeaseTimers, `${networkObjectId}-${iface}`)) return;

    const clientLeaseTimer = setInterval( async () => { 
        await reduceClientLeaseTime(networkObjectId, iface)
    }, 1000 );

    clientLeaseTimers[`${networkObjectId}-${iface}`] = clientLeaseTimer;
  
}

async function reduceClientLeaseTime(networkObjectId, iface) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute(`data-switch-${iface}`);
    const leaseTime = parseInt($networkObject.getAttribute(`data-dhcp-lease-time-${iface}`));
    const flagT1 = $networkObject.getAttribute(`data-dhcp-flag-t1-${iface}`);
    const flagT2 = $networkObject.getAttribute(`data-dhcp-flag-t2-${iface}`);
    const T1 = leaseTime * 0.5;
    const T2 = leaseTime * 0.875;

    $networkObject.setAttribute(
        `data-dhcp-current-lease-time-${iface}`, 
        parseInt($networkObject.getAttribute(`data-dhcp-current-lease-time-${iface}`)) + 1
    );

    const currentLeaseTime = parseInt($networkObject.getAttribute(`data-dhcp-current-lease-time-${iface}`));
    
    if (currentLeaseTime > T1 && flagT1 === "false") {
        $networkObject.setAttribute(`data-dhcp-flag-t1-${iface}`, "true");
        await dhcpRenewHandler(networkObjectId, "T1", iface);
        if (dhcpRequestFlag[networkObjectId] === true) $networkObject.setAttribute(`data-dhcp-flag-t1-${iface}`, "false");
        return;
    }

    if (currentLeaseTime > T2 && flagT2 === "false") {
        $networkObject.setAttribute(`data-dhcp-flag-t2-${iface}`, "true");
        await dhcpRenewHandler(networkObjectId, "T2", iface);
        if (dhcpRequestFlag[networkObjectId] === true) $networkObject.setAttribute(`data-dhcp-flag-t2-${iface}`, "false");
        return;
    }

    if (currentLeaseTime >= leaseTime ) {
        clearInterval(clientLeaseTimers[`${networkObjectId}-${iface}`]);
        delete clientLeaseTimers[`${networkObjectId}-${iface}`];
        deleteDhcpInfo(networkObjectId, iface);
        await dhcpDiscoverGenerator(networkObjectId, iface);
        return;
    }

}

/**ESTA FUNCION AÑADE UNA NUEVA RESERVA DE ALQUILER A LA BASE DE DATOS DE UN SERVIDOR DHCP */
function addDhcpReservation(networkObjectId, mac, ip) {
    
    const $networkObject = document.getElementById(networkObjectId);
    const rangeStart = $networkObject.getAttribute("data-range-start");
    const offerNetmask = $networkObject.getAttribute("dhcp-offer-netmask");
    const reservations = JSON.parse($networkObject.getAttribute("dhcp-reservations"));

    if (!isValidIp(ip)) throw new Error("Error: The IP address entered is not valid.");

    if (getNetwork(ip, offerNetmask) !== getNetwork(rangeStart, offerNetmask)) 
        throw new Error("Error: The IP address entered does not belong to the DHCP server's service range.");

    if (!isValidMac(mac)) throw new Error("Error: The MAC address entered is not valid.");

    reservations[mac] = ip;

    $networkObject.setAttribute("dhcp-reservations", JSON.stringify(reservations));

}

/**ESTA FUNCION ELIMINA UNA RESERVA DE ALQUILER DE LA BASE DE DATOS DE UN SERVIDOR DHCP */
function removeDhcpReservation(networkObjectId, mac) {
    const $networkObject = document.getElementById(networkObjectId);
    const reservations = JSON.parse($networkObject.getAttribute("dhcp-reservations"));
    delete reservations[mac];
    $networkObject.setAttribute("dhcp-reservations", JSON.stringify(reservations));
}

/**ESTA FUNCION DEVUELVE LA IP RESERVADA DE UN DISPOSITIVO PARA UNA DIRECCION MAC */
function getReservedIp(serverObjectId, mac) {
    const $serverObject = document.getElementById(serverObjectId);
    const reservations = JSON.parse($serverObject.getAttribute("dhcp-reservations"));
    let filteredMac = mac.trim().toUpperCase();
    if (reservations[filteredMac]) return reservations[filteredMac];
    return false;
}

/**ESTA FUNCION ACTUALIZA LA INFORMACION DE RED DE UNA INTERFAZ DE UN EQUIPO EN DHCP */
function setDhcpInfo(networkObjectId, packet, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const newIp = packet.yiaddr;
    const newNetmask = packet.netmask;
    const newGateway = packet.gateway;
    const newServer = packet.siaddr;
    const newDnsServers = (packet.dns).split(",").map(item => item.trim()).filter(item => item !== "");
    const newLeaseTime = packet.leasetime;

    //configuramos la interfaz
    configureInterface(networkObjectId, newIp, newNetmask, networkObjectInterface);
    setDefaultGateway(networkObjectId, newGateway);

    //configuramos la informacion DHCP del equipo
    $networkObject.setAttribute(`data-dhcp-server-${networkObjectInterface}`, newServer);
    $networkObject.setAttribute(`data-dhcp-lease-time-${networkObjectInterface}`, newLeaseTime);
    setDnsServers(networkObjectId, newDnsServers);

}

/**ESTA FUNCION ELIMINA LA INFORMACION DE RED DE UNA INTERFAZ (POR DEFECTO ENP0S3) DE UN EQUIPO EN DHCP */
function deleteDhcpInfo(networkObjectId, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);

    //deconfiguramos la interfaz y eliminamos la entrada de la tabla de enrutamiento
    deconfigureInterface($networkObject.id, networkObjectInterface);
    setDnsServers($networkObject.id, [""]);

    //eliminamos la informacion DHCP del equipo
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("data-dhcp-current-lease-time", "");
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");

    //eliminamos el timer de alquiler de cliente
    clearInterval(clientLeaseTimers[`${networkObjectId}-${networkObjectInterface}`]);
    delete clientLeaseTimers[`${networkObjectId}-${networkObjectInterface}`];
}

/**ESTA FUNCION INICIA DE NUEVO LA ACTUALIZACION DE LOS TIEMPOS DE ALQUILER DE LOS ALQUILERES DE UN SERVIDOR DHCP AL CARGAR UNA NUEVA RED*/
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
        const interfaces = getInterfaces(clientObjectId);
        if (leaseTime !== "" && !clientLeaseTimers[`${clientObjectId}-${interfaces[0]}`]) {
            clientLeaseTimers[`${clientObjectId}-${interfaces[0]}`] = setInterval( async () => { await reduceClientLeaseTime(clientObjectId, interfaces[0])}, 1000 );
        }
    });

}

/**ESTA FUNCION VALIDA LA CONFIGURACIÓN DE UN SERVIDOR DHCP */
function validateDhpcConfiguration(networkObjectId, configObject) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces($networkObject.id);

    //desglosamos el objeto de configuración

    const dhcpListenOnInterfaces = configObject.dhcpListenOnInterfaces; //interfaces como array
    const rangeStart = configObject.rangeStart;
    const rangeEnd = configObject.rangeEnd;
    const dhcpOfferGateway = configObject.dhcpOfferGateway;
    const dhcpOfferNetmask = configObject.dhcpOfferNetmask;
    const dhcpOfferDnsServers = configObject.dhcpOfferDnsServers; //servidores como array
    const dhcpOfferLeaseTime = configObject.dhcpOfferLeaseTime;

    //validamos los campos

    if (!dhcpListenOnInterfaces.every(item => availableInterfaces.includes(item))) {
        throw new Error(`Error: One or more of the listening interfaces are invalid.`);
    }

    if (!isValidIp(rangeStart)) throw new Error(`Error: A valid starting IP address was expected instead of "${rangeStart}".`);

    if (!isValidIp(rangeEnd)) throw new Error(`Error: A valid ending IP address was expected instead of "${rangeEnd}".`);

    if (!isValidIp(dhcpOfferNetmask)) throw new Error(`Error: A valid network mask was expected instead of "${dhcpOfferNetmask}".`);

    if (getNetwork(rangeStart, dhcpOfferNetmask) !== getNetwork(rangeEnd, dhcpOfferNetmask)) throw new Error(`Error: The IP address range is invalid.`);

    if (ipToBinary(rangeStart) >= ipToBinary(rangeEnd)) throw new Error(`Error: The IP range is invalid.`);

    if (dhcpOfferGateway !== "" && !isValidIp(dhcpOfferGateway)) {
    throw new Error(`Error: A valid gateway was expected instead of "${dhcpOfferGateway}".`);


    if (!dhcpOfferDnsServers.every(item => isValidIp(item))) throw new Error(`Error: Some of the DNS servers are invalid.`);

    if (isNaN(dhcpOfferLeaseTime)) throw new Error(`Error: A valid lease time was expected instead of "${dhcpOfferLeaseTime}".`);

    if (dhcpOfferLeaseTime < 120) throw new Error(`Error: The rental time must be greater than 120 seconds.`);

    if (dhcpOfferLeaseTime > 86400) throw new Error(`Error: The rental time must be less than 86400 seconds.`);

}

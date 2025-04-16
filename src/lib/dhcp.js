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

function checkIpinDhcp(serverObjectId, newip) {

    const serverObject = document.getElementById(serverObjectId);
    const dhcpTable = serverObject.querySelector(".dhcp-table").querySelector("table");
    const rows = dhcpTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ip = cells[0]
        if (newip === ip) return false;
    }

    return true
}

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

}

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

function updateServerLeaseTimes(serverObjectId) {

    const $serverObject = document.getElementById(serverObjectId);
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $leaseTimes = $leasesTable.querySelectorAll(".lease-time");

    $leaseTimes.forEach(leaseTime => {

        let time = parseInt(leaseTime.innerHTML, 10);

        if (time > 0) leaseTime.innerHTML = time - 1;

        if (time === 0) {
            let row = leaseTime.parentNode;
            row.remove();
        }

    });

    if ($leasesTable.querySelectorAll("tr").length === 1) {
        clearInterval(serverLeaseTimers[serverObjectId]);
        delete serverLeaseTimers[serverObjectId];
    }

}

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
            clientLeaseTimers[clientObjectId] = setInterval( async () => { await reducePcLeaseTime(clientObjectId)}, 1000 );
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
            if (table.querySelectorAll("tr").length === 1) { // Solo queda la cabecera
                clearInterval(window.leaseTimer);
                serverObject.setAttribute("data-interval", "false");
            }
            return;
        }
    }
}

function deleteAllDhcpLeases(serverObjectId) {

    const serverObject = document.getElementById(serverObjectId);
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        row.remove();
    }

    if (table.querySelectorAll("tr").length === 1) {
        clearInterval(window.leaseTimer);
        serverObject.setAttribute("data-interval", "false");
    }
}

function setDhcpInfo(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const $pcForm = document.querySelector(".pc-form");
    const newIp = packet.yiaddr;
    const newGateway = packet.gateway;
    const newNetmask = packet.netmask;
    const newServer = packet.siaddr;
    const newDns = packet.dns;
    const newLeaseTime = packet.leasetime;

    //actualizamos los atributos del cliente dhcp
    $networkObject.setAttribute("ip-enp0s3", newIp);
    $networkObject.setAttribute("data-gateway", newGateway);
    $networkObject.setAttribute("netmask-enp0s3", newNetmask);
    $networkObject.setAttribute("data-dhcp-server", newServer);
    $networkObject.setAttribute("data-dns-server", newDns);
    $networkObject.setAttribute("data-dhcp-lease-time", newLeaseTime);

    //si tenemos el menu grafico abierto, se actualizan los campos
    if ($pcForm.style.display === "flex" && $pcForm.querySelector("#form-item-id").innerHTML === networkObjectId) {
        $pcForm.querySelector("#ip").value = newIp;
        $pcForm.querySelector("#netmask").value = newNetmask;
        $pcForm.querySelector("#gateway").value = newGateway;
        $pcForm.querySelector("#dns-server").value = newDns;
        $pcForm.querySelector("#renew-btn").style.display = "block";
        $pcForm.querySelector("#release-btn").style.display = "block";
        $pcForm.querySelector("#get-btn").style.display = "none";
    }

}

async function updateClientLeaseTimer(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);

    $networkObject.setAttribute("data-dhcp-current-lease-time", 0);

    if (clientLeaseTimers[networkObjectId]) return;

    const clientLeaseTimer = setInterval( async () => { await reducePcLeaseTime(networkObjectId)}, 1000 );

    clientLeaseTimers[networkObjectId] = clientLeaseTimer;

}

async function reducePcLeaseTime(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const leaseTime = parseInt($networkObject.getAttribute("data-dhcp-lease-time"));
    const flagT1 = $networkObject.getAttribute("data-dhcp-flag-t1");
    const flagT2 = $networkObject.getAttribute("data-dhcp-flag-t2");
    const T1 = leaseTime * 0.5;
    const T2 = leaseTime * 0.875;

    //aumentamos el tiempo de alquiler

    $networkObject.setAttribute("data-dhcp-current-lease-time", parseInt($networkObject.getAttribute("data-dhcp-current-lease-time")) + 1 );
    const currentLeaseTime = parseInt($networkObject.getAttribute("data-dhcp-current-lease-time"));
    
    if (currentLeaseTime > T1 && flagT1 === "false") {
        $networkObject.setAttribute("data-dhcp-flag-t1", "true");
        let renewAttempt = await dhcpRenewHandler(networkObjectId, switchId);
        if (renewAttempt) $networkObject.setAttribute("data-dhcp-flag-t1", "false");
        return;
    }

    if (currentLeaseTime > T2 && flagT2 === "false") {
        $networkObject.setAttribute("data-dhcp-flag-t2", "true");
        let renewAttempt = await dhcpRenewHandler(networkObjectId, switchId, "T2");
        if (renewAttempt) $networkObject.setAttribute("data-dhcp-flag-t2", "false");
        return;
    }

    if (currentLeaseTime >= leaseTime ) {
        clearInterval(clientLeaseTimers[networkObjectId]);
        delete clientLeaseTimers[networkObjectId];
        deleteDhcpInfo(networkObjectId);
        await dhcpDiscoverGenerator(networkObjectId, switchId);
        return;
    }

}

function deleteDhcpInfo(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const $pcForm = document.querySelector(".pc-form");

    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("data-dhcp-current-lease-time", "");
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");

    if ($pcForm.style.display === "flex" && $pcForm.querySelector("#form-item-id").innerHTML === networkObjectId) {
        $pcForm.querySelector("#ip").value = "";
        $pcForm.querySelector("#netmask").value = "";
        $pcForm.querySelector("#gateway").value = "";
        $pcForm.querySelector("#dns-server").value = "";
        $pcForm.querySelector("#renew-btn").style.display = "none";
        $pcForm.querySelector("#release-btn").style.display = "none";
        $pcForm.querySelector("#get-btn").style.display = "block";
    }
}
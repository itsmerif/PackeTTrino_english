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

    const serverObject = document.getElementById(serverObjectId);
    const leaseTime = serverObject.getAttribute("offer-lease-time");
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${newip}</td>
        <td>${newmac}</td>
        <td>${newhostname}</td>
        <td class="lease-time">${leaseTime}</td>`;
    table.appendChild(newRow);

    if (!leaseTimers[serverObjectId]) {
        leaseTimers[serverObjectId] = setInterval(() => updateLeaseTime(serverObjectId), 1000);
    }
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

function updateLeaseTime(serverObjectId) {
    const serverObject = document.getElementById(serverObjectId);
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const leases = table.querySelectorAll(".lease-time");

    leases.forEach(lease => {
        let time = parseInt(lease.innerHTML, 10);
        if (time > 0) {
            lease.innerHTML = time - 1;
        }
        if (time === 0) {
            let row = lease.parentNode;
            row.remove();
        }
    });

    if (table.querySelectorAll("tr").length === 1) {
        clearInterval(leaseTimers[serverObjectId]);
        delete leaseTimers[serverObjectId];
    }
}

function startLeaseTimers() {

    const $dhcpServers = Array.from(document.querySelectorAll(".item-dropped")).filter($networkObject => $networkObject.getAttribute("dhcpd") !== null);

    $dhcpServers.forEach(server => {
        const serverObjectId = server.id;
        const table = server.querySelector(".dhcp-table table");
        const leases = table.querySelectorAll("tr");
        if (leases.length > 1 && !leaseTimers[serverObjectId]) {
            leaseTimers[serverObjectId] = setInterval(() => updateLeaseTime(serverObjectId), 1000);
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
    restartClientLeaseTimer(networkObjectId);

    //si tenemos el menu grafico abierto, se actualizan los campos

    if ($pcForm.style.display === "flex") {
        $pcForm.querySelector("#ip").value = newIp;
        $pcForm.querySelector("#netmask").value = newNetmask;
        $pcForm.querySelector("#gateway").value = newGateway;
        $pcForm.querySelector("#dns-server").value = newDns;
        $pcForm.querySelector("#renew-btn").style.display = "block";
        $pcForm.querySelector("#release-btn").style.display = "block";
        $pcForm.querySelector("#get-btn").style.display = "none";
    }

}

async function restartClientLeaseTimer(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("data-dhcp-current-lease-time", 0);
    if (leaseTimers[networkObjectId]) return;
    const clientLeaseTimer = setInterval( async () => { await reducePcLeaseTime(networkObjectId)}, 1000 );
    leaseTimers[networkObjectId] = clientLeaseTimer;
}

async function reducePcLeaseTime(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const leaseTime = parseInt($networkObject.getAttribute("data-dhcp-lease-time"));
    const T1 = leaseTime * 0.5;
    const T2 = leaseTime * 0.875;

    $networkObject.setAttribute("data-dhcp-current-lease-time", parseInt($networkObject.getAttribute("data-dhcp-current-lease-time")) + 1);
    
    if ( $networkObject.getAttribute("data-dhcp-current-lease-time") > T1 ) {
        await command_Dhcp($networkObject.id, ["dhcp", "-renew"]);
        return;
    }

    if ( $networkObject.getAttribute("data-dhcp-current-lease-time") > T2 ) {
        await command_Dhcp($networkObject.id, ["dhcp", "-renew"]);
        return;
    }

    if ($networkObject.getAttribute("data-dhcp-current-lease-time") >= leaseTime ) {

        $networkObject.setAttribute("data-dhcp-lease-time", "");
        $networkObject.setAttribute("data-dhcp-current-lease-time", "");
        clearInterval(leaseTimers[networkObjectId]);
        delete leaseTimers[networkObjectId];
        await command_Dhcp($networkObject.id, ["dhcp", "-renew"]);
        return;

    }

}

function deleteDhcpInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $pcForm = document.querySelector(".pc-form");
    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-dhcp-server", "");

    if ($pcForm.style.display === "flex") {
        $pcForm.querySelector("#ip").value = "";
        $pcForm.querySelector("#netmask").value = "";
        $pcForm.querySelector("#gateway").value = "";
        $pcForm.querySelector("#dns-server").value = "";
        $pcForm.querySelector("#renew-btn").style.display = "none";
        $pcForm.querySelector("#release-btn").style.display = "none";
        $pcForm.querySelector("#get-btn").style.display = "block";
    }
}

function renewLeaseTime(ip) {
    const $networkObject = document.querySelector(`[data-ip='${ip}']`);
    const networkObjectId = $networkObject.id;
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const isDHCPon = $networkObject.getAttribute("dhclient");
    if (isDHCPon === "false") return;
    dhcpRequestGenerator(networkObjectId, switchId);
}
async function command_Dhcp(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const switchObjectId = $networkObject.getAttribute("data-switch");
    const isDchpOn = $networkObject.getAttribute("dhclient");
    const option = args[1];

    cleanPacketTraffic();

    if (!dataId.startsWith("pc-")) {
        terminalMessage("Error: Este comando solo puede ser ejecutado desde un pc.");
        return;
    }

    if (isDchpOn === "false") {
        terminalMessage("Error: Equipo No Configurado Como Cliente DHCP");
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error de argumentos. Sintáxis: dhcp &lt; discover | -renew | -release &gt; ");
        return;
    }

    const dhcpFunctions = {
        "-discover": async () => await dhcpDiscoverHandler(dataId, switchObjectId),
        "-renew": async () => await dhcpRenewHandler(dataId, switchObjectId),
        "-release": async () => await dhcpReleaseHandler(dataId, switchObjectId)
    }

    if (option in dhcpFunctions) await dhcpFunctions[option]();

}

async function dhcpDiscoverHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");

    if (networkObjectIp !== "") {
        terminalMessage("Error: Este equipo ya tiene una IP asignada.");
        return;
    };

    terminalMessage(`Listening on LPF/enp0s3/${networkObjectMac}`);
    terminalMessage(`Sending on   LPF/enp0s3/${networkObjectMac}`);
    terminalMessage("Sending on   Socket/fallback");
    terminalMessage(`DHCPDISCOVER on enp0s3 to 255.255.255.255 port 67 interval 6`);

    try {

        dhcpDiscoverFlag = false;
        dhcpRequestFlag = false;

        if (visualToggle) await minimizeTerminal();

        await dhcpDiscoverGenerator(networkObjectId, switchObjectId);

        if (visualToggle) await maximizeTerminal();

        if (dhcpDiscoverFlag === false || dhcpRequestFlag === false) {
            terminalMessage("Error: No se pudo encontrar un servidor DHCP.");
            return;
        }


    } catch (error) {

        terminalMessage("Error: " + error);
        return;

    }

}

async function dhcpRenewHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.");
        return;
    }

    if (visualToggle) await minimizeTerminal();

    try {

        await dhcpRenewGenerator(networkObjectId, switchObjectId);
        terminalMessage("IP renovada correctamente."); //TODO -> generar un mensaje de exito real de un dhcp

    } catch (error) {

        terminalMessage("Error: " + error);

    }

    if (visualToggle) await maximizeTerminal();

}

async function dhcpReleaseHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.");
        return;
    }

    terminalMessage(`Listening on LPF/enp0s3/${networkObjectMac}`);
    terminalMessage(`Sending on   LPF/enp0s3/${networkObjectMac}`);
    terminalMessage("Sending on   Socket/fallback");
    terminalMessage(`DHCPRELEASE of ${networkObjectIp} on enp0s3 to ${networkObjectDhcpServer} port 67`);
    await dhcpReleaseGenerator(networkObjectId, switchObjectId);
    return;
}

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

    // Si el temporizador no existe, inicia uno
    if (!leaseTimers[serverObjectId]) {
        leaseTimers[serverObjectId] = setInterval(() => updateLeaseTime(serverObjectId), 1000);
    }
}

function updateDhcpEntry(serverObjectId, newip) {
    const serverObject = document.getElementById(serverObjectId);
    const leaseTime = serverObject.getAttribute("offer-lease-time");
    const table = serverObject.querySelector(".dhcp-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ip = cells[0].innerHTML;

        if (ip === newip) {
            cells[3].innerHTML = leaseTime;
            return;
        }
    }
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
    const dhcpServers = document.querySelectorAll(".dhcp-server");

    dhcpServers.forEach(server => {
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
    let newIp = packet.yiaddr;
    let newGateway = packet.gateway;
    let newNetmask = packet.netmask;
    let newServer = packet.siaddr;
    let newDns = packet.dns;
    $networkObject.setAttribute("data-ip", newIp);
    $networkObject.setAttribute("data-gateway", newGateway);
    $networkObject.setAttribute("data-netmask", newNetmask);
    $networkObject.setAttribute("data-dhcp-server", newServer);
    $networkObject.setAttribute("data-dns-server", newDns);

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

function deleteDhcpInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $pcForm = document.querySelector(".pc-form");
    $networkObject.setAttribute("data-ip", "");
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-netmask", "");
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
    const switchId = $networkObject.getAttribute("data-switch");
    const isDHCPon = $networkObject.getAttribute("dhclient");
    if (isDHCPon === "false") return;
    dhcpRenewGenerator(networkObjectId, switchId);
}
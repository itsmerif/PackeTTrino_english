async function command_Dhcp(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const switchObjectId = $networkObject.getAttribute("data-switch-enp0s3");
    const isDchpOn = $networkObject.getAttribute("dhclient");
    const option = args[1];

    if (!dataId.startsWith("pc-")) {
        terminalMessage("Error: Este comando solo puede ser ejecutado desde un pc.", dataId);
        return;
    }

    if (isDchpOn === "false") {
        terminalMessage("Error: Equipo No Configurado Como Cliente DHCP", dataId);
        return;
    }   

    if (args.length !== 2) {
        terminalMessage("Error de argumentos. Sintáxis: dhcp &lt; discover | -renew | -release &gt; ", dataId);
        return;
    }

    const dhcpFunctions = {
        "-discover": async () => await dhcpDiscoverHandler(dataId, switchObjectId),
        "-renew": async () => await dhcpRenewHandler(dataId, switchObjectId),
        "-release": async () => await dhcpReleaseHandler(dataId, switchObjectId),
    }

    if (option in dhcpFunctions) {
        cleanPacketTraffic();
        if (visualToggle) await minimizeTerminal();
        await dhcpFunctions[option]();
        if (visualToggle) await maximizeTerminal();
    }

}

async function dhcpDiscoverHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    if (networkObjectIp !== "") {
        terminalMessage("Error: Este equipo ya tiene una IP asignada.", networkObjectId);
        return;
    }

    terminalMessage(`Listening on LPF/enp0s3/${networkObjectMac}`, networkObjectId);
    terminalMessage(`Sending on   LPF/enp0s3/${networkObjectMac}`, networkObjectId);
    terminalMessage("Sending on   Socket/fallback", networkObjectId);
    terminalMessage(`DHCPDISCOVER on enp0s3 to 255.255.255.255 port 67 interval 6`, networkObjectId);

    try {

        dhcpDiscoverFlag[networkObjectId] = false;
        dhcpRequestFlag[networkObjectId] = false;

        await dhcpDiscoverGenerator(networkObjectId, switchObjectId);

        if (dhcpDiscoverFlag[networkObjectId] === false || dhcpRequestFlag[networkObjectId] === false) {
            terminalMessage("Error: No se pudo encontrar un servidor DHCP.", networkObjectId);
            return;
        }


    } catch (error) {

        terminalMessage("Error: " + error, networkObjectId);

    }

}

async function dhcpRenewHandler(networkObjectId, switchObjectId, renewPhase = "T1") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPREQUEST on enp0s3 to ${networkObjectDhcpServer} port 67`, networkObjectId);

    dhcpRequestFlag[networkObjectId] = false;

    try {
        await dhcpRequestGenerator(networkObjectId, switchObjectId, renewPhase);
    } catch (error) {
        terminalMessage("Error: " + error, networkObjectId);
    }
    
}

async function dhcpReleaseHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPRELEASE of ${networkObjectIp} on enp0s3 to ${networkObjectDhcpServer} port 67`, networkObjectId);
    await dhcpReleaseGenerator(networkObjectId, switchObjectId);
}
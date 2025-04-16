async function command_Dhcp(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const switchObjectId = $networkObject.getAttribute("data-switch-enp0s3");
    const leaseTime = parseInt($networkObject.getAttribute("data-dhcp-lease-time"));
    const currentLeaseTime = parseInt($networkObject.getAttribute("data-dhcp-current-lease-time"));
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
        "-release": async () => await dhcpReleaseHandler(dataId, switchObjectId),
        "-leasetime": async () => terminalMessage(`Tiempo de Alquiler restante: ${leaseTime - currentLeaseTime}`)
    }

    if (option in dhcpFunctions) await dhcpFunctions[option]();

}

async function dhcpDiscoverHandler(networkObjectId, switchObjectId) {


    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

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
        console.log(error);
        return;

    }

}

async function dhcpRenewHandler(networkObjectId, switchObjectId, renewPhase = "T1") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.");
        return;
    }

    if (visualToggle) await minimizeTerminal();

    dhcpRequestFlag = false;

    try {
        await dhcpRequestGenerator(networkObjectId, switchObjectId, renewPhase);
    } catch (error) {
        terminalMessage("Error: " + error);
    }

    if (!dhcpRequestFlag) {
        terminalMessage("Error: No se pudo renovar la IP.");
        return;
    }

    terminalMessage("IP renovada correctamente.");

    if (visualToggle) await maximizeTerminal();

    return true;
    
}

async function dhcpReleaseHandler(networkObjectId, switchObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
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
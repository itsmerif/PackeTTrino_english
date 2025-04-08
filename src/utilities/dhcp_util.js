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
async function dhcp(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const $networkObjectIp = $networkObject.getAttribute("data-ip");
    const switchObjectId = $networkObject.getAttribute("data-switch");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");
    const isDchpOn = $networkObject.getAttribute("data-dhcp")

    cleanPacketTraffic(); //limpiamos la tabla de paquetes

    if (dataId.includes("router-")) { //por ahora solo se puede hacer ping desde un pc
        terminalMessage("Error: Este comando solo puede ser ejecutado desde un pc.");
        return;
    }

    if (isDchpOn === "false") {
        terminalMessage("Error: Equipo No Configurado Como DHCP");
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error de argumentos. Sintáxis: dhcp < -renew | -release > ");
        //console.log(isDchpOn);
        return;
    }

    if (args[1] === "-renew") {

        if (!$networkObjectIp || networkObjectDhcpServer === "") { //no tenemos una ip, tenemos que buscar uno

            terminalMessage("Buscando servidor DHCP...");

            try {

                dhcpDiscoverFlag = false;
                dhcpRequestFlag = false;

                if (visualToggle) await minimizeTerminal();
                await dhcpDiscoverGenerator(dataId, switchObjectId);
                if (visualToggle) await maximizeTerminal();

                if (dhcpDiscoverFlag === false || dhcpRequestFlag === false) {
                    terminalMessage("Error: No se pudo encontrar un servidor DHCP.");
                    return;
                }

                terminalMessage("Servidor DHCP encontrado correctamente.");
                showObjectInfo(dataId);

            } catch (error) {

                terminalMessage("Error: " + error);
                return;

            }

        } else {
            
            //terminalMessage("Renovando IP...");

            try {
                dhcpRenewGenerator(dataId, switchObjectId);
            } catch (error) {
                terminalMessage("Error: " + error);
                return;
            }

        }

        //command_Ip(dataId, ["ip", "a"]);
        return;
    }

    if (args[1] === "-release") {

        if (!$networkObjectIp) {
            terminalMessage("No hay ninguna IP para liberar.");
            return;
        }

        terminalMessage("Liberando dirercción IP...");
        dhcpReleaseGenerator(dataId, switchObjectId);
        return;
    }

}
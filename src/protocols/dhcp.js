function dhcp(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const $networkObjectIp = $networkObject.getAttribute("data-ip");
    const switchObjectId = $networkObject.getAttribute("data-switch");
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

        if (!$networkObjectIp) { //no tenemos una ip, tenemos que buscar uno

            //terminalMessage("Buscando servidor DHCP...");

            try {

                dhcpDiscoverFlag = false;
                dhcpRequestFlag = false;

                dhcpDiscoverGenerator(dataId, switchObjectId);

                if (dhcpDiscoverFlag === false || dhcpRequestFlag === false) {
                    ping_f("0.0.0.0");
                    return;
                }

                ping_s("0.0.0.0");

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
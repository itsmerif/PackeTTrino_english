function dhcp(dataId, args) {
    
    const $networkObject = document.getElementById(dataId);
    const switchObjectId = $networkObject.getAttribute("data-switch");
    const isDchpOn = $networkObject.getAttribute("data-dhcp")

    if (dataId.includes("router-")) { //por ahora solo se puede hacer ping desde un pc
        terminalMessage("Error: Este comando solo puede ser ejecutado desde un pc.");
        return;
    }

    if (isDchpOn === "false") {
        terminalMessage("Error: Equipo No Configurado Como DHCP");
        return;
    }

    if (args.length !== 2){
        terminalMessage("Error de argumentos. Sintáxis: dhcp < -renew | -release > ");
        console.log(isDchpOn);
        return;
    }

    if (args[1] === "-renew") {
        terminalMessage("Buscando servidor DHCP...");
        dhcpDiscoverGenerator(dataId, switchObjectId);
        return;
    }

    cleanPacketTraffic(); //limpiamos la tabla de paquetes

}
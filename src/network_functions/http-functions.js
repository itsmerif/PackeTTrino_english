function command_http(id, args) {

    const $networkObject = document.getElementById(id);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const switchId = $networkObject.getAttribute("data-switch");

    if (!networkObjectIp || !networkObjectMac || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    if (!switchId) {
        terminalMessage("Error: No se ha detectado conexión a ninguna red.");
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: http [ip]");
        return;
    }

    if (!args[1].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
        terminalMessage("Error: La IP introducida no es válida.");
        return;
    }

    http(id, args[1]);

}


function http(networkObjectId, destination) {

    cleanPacketTraffic(); //limpiamos el registro de paquetes

    //http viaja por tcp, necesitamos establecer la conexión

    tcpSyncFlag = false;

    tcp(networkObjectId, destination, 80);

    setTimeout(() => {

        if (!tcpSyncFlag) {
            terminalMessage(networkObjectId + ": No se pudo establecer la conexión.");
            return;
        }

        terminalMessage(networkObjectId + ": Conexión establecida con éxito.");

        //httpRequestPacketGenerator(networkObjectId, switchId, destination, "/");

    }, 500);

}
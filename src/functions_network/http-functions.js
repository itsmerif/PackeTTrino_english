async function command_http(id, args) {

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

    await http(id, args[1]);

}

async function http(networkObjectId, arg) {
    
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch");
    delete browserBuffer[networkObjectId];
    let destinationIp = arg;
    cleanPacketTraffic(); 

    if (visualToggle) await minimizeTerminal();

    //si es un dominio, intentamos resolverlo
    
    if (!isValidIp(destinationIp)) { 
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) {
            if (visualToggle) await maximizeTerminal();
            throw new Error("Error: No se pudo resolver el dominio.");
        }
    }

    //http viaja por tcp, necesitamos establecer la conexión

    await tcp(networkObjectId, destinationIp, 80);
    if (!tcpSyncFlag)  {
        if (visualToggle) await maximizeTerminal();
        throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");
    }

    //hemos establecido la conexión, enviamos el paquete

    await httpRequestPacketGenerator(networkObjectId, switchId, destinationIp);
    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) {
        if (visualToggle) await maximizeTerminal();
        throw new Error("Error: No se ha recibido respuesta del servidor web.");
    }

    //si todo salió bien, mostramos el contenido
    
    if (visualToggle) await maximizeTerminal();
    terminalMessage("Conexión establecida con el servidor web.");
    let content = htmlReply.body;
    const $browserContent = document.querySelector(".browser-content");
    $browserContent.srcdoc = content;
}
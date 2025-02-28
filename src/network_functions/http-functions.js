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

    cleanPacketTraffic(); //limpiamos el registro de paquetes
    delete browserBuffer[networkObjectId]; //limpiamos el buffer de paquetes http

    let destinationIp;

    //si es un dominio, buscamos la ip con una peticion dns
    
    if (!isValidIp(arg)) { //asumimos que sea un dominio

        dnsRequestFlag = false;

        await dig(networkObjectId, arg, false);
        
        if (!dnsRequestFlag) {
            throw new Error("Error: No se pudo resolver el nombre de dominio.");
        }

        destinationIp = isDomainInCachePc(networkObjectId, arg)[1];

    } else { //es una ip válida

        destinationIp = arg;

    }

    //http viaja por tcp, necesitamos establecer la conexión

    tcpSyncFlag = false;

    await tcp(networkObjectId, destinationIp, 80);

    setTimeout(() => {

        if (!tcpSyncFlag) {
            throw new Error(networkObjectId + ": No se pudo establecer la conexión.");
        }

    }, 500);

    //hemos establecido la conexión, enviamos el paquete

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch");
    await httpRequestPacketGenerator(networkObjectId, switchId, destinationIp);

    //esperamos a que el servidor web responda

    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) {
        throw new Error("Error: No se ha recibido respuesta del servidor web.");
    }

    //si todo salió bien, mostramos el contenido
    
    let content = htmlReply.body;
    const $browserContent = document.querySelector(".browser-content");
    $browserContent.srcdoc = content;
}
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
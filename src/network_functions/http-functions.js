async function http(networkObjectId, arg) {
    
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch");
    delete browserBuffer[networkObjectId];
    let destinationIp = arg;
    cleanPacketTraffic(); 

    //si es un dominio, intentamos resolverlo
    
    if (!isValidIp(destinationIp)) { 
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) throw new Error("Error: No se pudo resolver el dominio.");   
    }

    //http viaja por tcp, necesitamos establecer la conexión

    await tcp(networkObjectId, destinationIp, 80);
    if (!tcpSyncFlag) throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");

    //hemos establecido la conexión, enviamos el paquete

    await httpRequestPacketGenerator(networkObjectId, switchId, destinationIp);
    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) throw new Error("Error: No se ha recibido respuesta del servidor web.");

    //si todo salió bien, mostramos el contenido
    
    let content = htmlReply.body;
    const $browserContent = document.querySelector(".browser-content");
    $browserContent.srcdoc = content;
}
async function http(networkObjectId, destinationIp, method, port) {

    if (isNaN(port) || port < 1 || port > 65535) throw new Error(`Error: Puerto ${port} no válido.`);

    if (!isValidIp(destinationIp)) {
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) throw new Error("Error: No se pudo resolver el dominio.");
    }

    if (isLocalIp(networkObjectId,destinationIp)) return getApacheWebContent(networkObjectId); 

    delete browserBuffer[networkObjectId]; //<-- borramos el buffer de respuesta anterior

    //iniciamos la sincronización TCP
    const source_port = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152; // <--- generamos un puerto efímero aleatorio para el origen
    await tcpSynPacketGenerator(networkObjectId, destinationIp, source_port, port); 
    if (tcpSyncFlag[networkObjectId] === false) throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");

    //realizamos la petición HTTP
    await httpRequestPacketGenerator(networkObjectId, destinationIp, source_port, port, method);

    //comprobamos si hay respuesta en el buffer
    const htmlReply = browserBuffer[networkObjectId];
    if (!htmlReply) throw new Error("Error: No se ha recibido respuesta del servidor web.");
    return htmlReply.body;
    
}

async function httpRequestPacketGenerator(networkObjectId, destinationIp, source_port, destination_port, method) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkjObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkjObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkjObjectInterface}`);

    let packet = new httpRequest(
        networkObjectIp, //ip del origen
        destinationIp, //ip del destino
        networkObjectMac, //mac del origen
        "", //mac del destino
        source_port, //puerto del origen
        destination_port, //puerto del destino
        method //método
    );

    await hostRouting(networkObjectId, packet);
}
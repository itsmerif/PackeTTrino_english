async function http(networkObjectId, destinationIp, method, port) {

    const $networkObject = document.getElementById(networkObjectId);
    let domainName; //<-- nos lo quedamos para usarlo como host

    //comprobamos que el puerto y método sean válidos

    if (isNaN(port) || port < 1 || port > 65535) throw new Error(`Error: Puerto ${port} no válido.`);

    if (!["GET", "POST", "PUT", "DELETE"].includes(method.toUpperCase())) throw new Error(`Error: Método ${method} no válido.`);

    //comprobamos si es una IP o un dominio

    if (!isValidIp(destinationIp)) {
        domainName = destinationIp;
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) throw new Error(`Error: No se pudo resolver el dominio "${domainName}".`);
    }

    //creamos los headers

    const headers = {
        "method": method,
        "host": domainName || destinationIp
    }

    //comprobamos si es un servidor web local

    if (isLocalIp(networkObjectId, destinationIp)) {

        const newPacket = await apache_service(networkObjectId,

            new httpRequest(
                $networkObject.getAttribute(`ip-${getInterfaces(networkObjectId)[0]}`), //ip del origen
                destinationIp, //ip del destino
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`), //mac del origen
                "", //mac del destino
                Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152, // <--- generamos un puerto aleatorio para el origen
                port, //puerto del destino
                headers["method"], //método
                headers["host"] //host
            )

        );

        return newPacket;

    }

    delete httpBuffer[networkObjectId]; //<-- borramos el buffer de respuesta anterior

    //iniciamos la sincronización TCP

    const source_port = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152; // <--- generamos un puerto efímero aleatorio para el origen

    await tcpSynPacketGenerator(networkObjectId, destinationIp, source_port, port);

    if (tcpSyncFlag[networkObjectId] === false) throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");

    //realizamos la petición HTTP

    await httpRequestPacketGenerator(networkObjectId, destinationIp, source_port, port, headers);

    //comprobamos si hay respuesta en el buffer

    const newPacket = httpBuffer[networkObjectId];
    
    if (!newPacket) throw new Error("Error: Conexión rechazada. No se ha recibido respuesta del servidor web.");

    return newPacket //devolvemos el objeto HTTPReply

}

async function httpRequestPacketGenerator(networkObjectId, destinationIp, source_port, destination_port, headers) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkjObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkjObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkjObjectInterface}`);

    //extraemos los headers que usaremos
    const methodHeader = headers["method"];
    const hostHeader = headers["host"];

    let packet = new httpRequest(
        networkObjectIp, //ip del origen
        destinationIp, //ip del destino
        networkObjectMac, //mac del origen
        "", //mac del destino
        source_port, //puerto del origen
        destination_port, //puerto del destino
        methodHeader, //método,
        hostHeader //host
    );

    await routing(networkObjectId, packet, true);

}
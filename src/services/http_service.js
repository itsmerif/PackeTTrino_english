async function http(networkObjectId, headers) {

    const $networkObject = document.getElementById(networkObjectId);
    let domainName;

    //comprobamos que el puerto y método sean válidos

    if (isNaN(headers["dport"]) || headers["dport"] < 1 || headers["dport"] > 65535) throw new Error(`Error: Port ${headers["dport"]} is invalid.`);

    if (!["GET", "POST", "PUT", "DELETE"].includes(headers.method.toUpperCase())) throw new Error(`Error: Method ${headers.method} is invalid.`);

    //comprobamos si es una IP o un dominio

    if (!isValidIp(headers["address"])) {
        domainName = headers["address"];
        headers["address"] = await domainNameResolution(networkObjectId, headers["address"]);
        if (!headers["address"]) throw new Error(`Error: The domain "${domainName}" could not be resolved.`);
    }

    headers["host"] = domainName || headers["address"]; //guardamos el nombre de dominio que se utilizó
    headers["sport"] = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152; // <--- generamos un puerto aleatorio para el origen

    //comprobamos si es un servidor web local
    if (isLocalIp(networkObjectId, headers["address"])) {

        const newPacket = await apache_service(networkObjectId,

            new httpRequest(
                $networkObject.getAttribute(`ip-${getInterfaces(networkObjectId)[0]}`), //ip del origen
                headers["address"], //ip del destino
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`), //mac del origen
                "", //mac del destino
                headers["sport"], //puerto del origen
                headers["dport"], //puerto del destino
                headers["method"], //método
                headers["host"], //host
                headers["resource"] //resource
            )

        );

        return newPacket;

    }

    delete httpBuffer[networkObjectId]; //<-- borramos el buffer de respuesta anterior

    //iniciamos la sincronización TCP

    await tcpSynPacketGenerator(networkObjectId, headers["address"], headers["sport"], headers["dport"]);

    if (tcpSyncFlag[networkObjectId] === false) throw new Error(networkObjectId + ": The TCP connection could not be established.");

    //realizamos la petición HTTP

    await httpRequestPacketGenerator(networkObjectId, headers);

    //comprobamos si hay respuesta en el buffer

    const newPacket = httpBuffer[networkObjectId];
    
    if (!newPacket) throw new Error("Error: Connection refused. No response was received from the web server.");

    return newPacket //devolvemos el objeto HTTPReply

}

async function httpRequestPacketGenerator(networkObjectId, headers) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkjObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkjObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkjObjectInterface}`);

    let packet = new httpRequest(
        networkObjectIp, //ip del origen
        headers["address"], //ip del destino
        networkObjectMac, //mac del origen
        "", //mac del destino
        headers["sport"], //puerto del origen
        headers["dport"], //puerto del destino
        headers["method"], //método,
        headers["host"], //host
        headers["resource"] //resource
    );

    await routing(networkObjectId, packet, true);

}

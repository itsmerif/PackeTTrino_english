async function command_ping(networkObjectId, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    const stateHandler = {
        0: () => pingSuccess(destination),
        1: () => terminalMessage(`ping: ${destination}: Nombre o servicio desconocido.`, networkObjectId),
        2: () => terminalMessage(`ping: ${destination}: La dirección IP no es válida.`, networkObjectId),
        3: () => pingFailure(destination)
    }

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("ping: connect: La red es inaccesible.", networkObjectId);
        return;
    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    let stateCode = await ping(networkObjectId, destination); //<-- realizamos el ping obteniendo el codigo de estado

    stateHandler[stateCode](); //<-- ejecutamos el manejador de estados
    
    if (visualToggle) await maximizeTerminal();

}

async function icmpTryoutProcess(id) {

    const $networkObject = document.getElementById(id);
    const $board = document.querySelector(".board");
    
    const objectIp = getAvailableIps($networkObject.id)[0];

    if (!objectIp) {
        bodyComponent.render(popupMessage("<span>Error: </span> No se ha encontrado la IP del objeto " + id));
        return;
    }

    if (icmpTryoutObject === "") {        
        icmpTryoutObject = id;
        createPacketIndicator(id);
        return;
    }

    createPacketIndicator(id);

    visualToggle =  true;

    await ping(icmpTryoutObject, objectIp);
    
    $board.querySelectorAll(".pack-cursor").forEach(cursor => {cursor.remove();});

    icmpTryoutObject = "";

}
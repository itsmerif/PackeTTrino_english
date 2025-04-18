async function command_ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    const stateHandler = {
        0: () => pingSuccess(args[1]),
        1: () => terminalMessage(`ping: ${args[1]}: Nombre o servicio desconocido.`, dataId),
        2: () => terminalMessage(`ping: ${args[1]}: La dirección IP no es válida.`, dataId),
        3: () => pingFailure(args[1])
    }

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping  &lt;ip | dominio&gt;", dataId);
        return;
    }

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("ping: connect: La red es inaccesible.", dataId);
        return;
    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    let stateCode = await ping(dataId, args[1]);

    stateHandler[stateCode]();
    
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
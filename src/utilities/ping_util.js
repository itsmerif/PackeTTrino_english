async function command_ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping  &lt;ip | dominio&gt;");
        return;
    }

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("ping: connect: La red es inaccesible.");
        return;
    }

    await ping(dataId, args);

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

    await ping(icmpTryoutObject, ["ping", objectIp]);

    visualToggle = false;
    
    $board.querySelectorAll(".pack-cursor").forEach(cursor => {cursor.remove();});

    icmpTryoutObject = "";

}
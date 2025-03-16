async function command_ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const switchObjectId = $networkObject.getAttribute("data-switch");

    //gestion de entrada

    if (dataId.includes("router-")) { //se reenvia a la funcion especifica para routers
        router_ping(dataId, args);
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping <ip | dominio>");
        return;
    }

    //gestion de equipo

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    ping(dataId, args);

}
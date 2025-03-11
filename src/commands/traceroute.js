function command_traceroute(dataId, args) {

    //gestion de equipo

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    //gestion de entrada

    switch (args.length) {
        case 2:
            traceroute(dataId, args[1]);
            break;
        case 3:
            if (args[1] === "-n") {
                traceroute(dataId, args[2], true);
            } else {
                terminalMessage("Error: sintaxis: traceroute [-n] destino");
            }
            break;
        default:
            terminalMessage("Error: sintaxis: traceroute [-n] destino");
            return;
    }

}
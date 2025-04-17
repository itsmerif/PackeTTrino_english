async function command_traceroute(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    let destination;
    let useNumeric = false;

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.", dataId);
        return;
    }

    if (args.length === 2) {

        destination = args[1];

    }else if (args.length === 3 && args[1] === "-n") {

        destination = args[2];
        useNumeric = true;

    }else  {

        terminalMessage("Error: Sintaxis: traceroute [-n] destino", dataId);
        return;

    }

    const stateHandler = {
        1: () => terminalMessage(`traceroute: Nombre ${destination} o servicio desconocido.`, dataId),
    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    let stateCode = await traceroute(dataId, destination, useNumeric);

    if (stateHandler[stateCode]) stateHandler[stateCode]();

    if (visualToggle) await maximizeTerminal();

}
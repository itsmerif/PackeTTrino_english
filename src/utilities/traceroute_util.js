async function command_traceroute(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    let destination;
    let useNumeric = false;

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.", networkObjectId);
        return;
    }

    if (args.length === 1) {
        destination = args[0];
    }else if (args.length === 2 && args[0] === "-n") {
        destination = args[1];
        useNumeric = true;
    }else  {
        terminalMessage("Error: Sintaxis: traceroute [-n] destino", networkObjectId);
        return;
    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();
    await traceroute(networkObjectId, destination, useNumeric);
    if (visualToggle) await maximizeTerminal();

}
async function command_http(id, args) {

    const $networkObject = document.getElementById(id);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");

    if (!networkObjectIp || !networkObjectMac || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    if (!switchId) {
        terminalMessage("Error: No se ha detectado conexión a ninguna red.");
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: http [ip]");
        return;
    }

    await http(id, args[1]);

}
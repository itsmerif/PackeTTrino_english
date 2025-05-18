function command_apache(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");

    if (!networkObjectIp || !networkObjectMac || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.", networkObjectId);
        return;
    }

    if (args[1] === "on") {
        $networkObject.setAttribute("apache2", "on");
        terminalMessage("Servidor web encendido correctamente.", networkObjectId);
        return;
    }

    if (args[1] === "off") {
        $networkObject.setAttribute("apache2", "off");
        terminalMessage("Servidor web apagado correctamente.", networkObjectId);
        return;
    }

    if (args[1] === "status") {
        ($networkObject.getAttribute("apache2") === "on") 
        ? terminalMessage("Servidor web encendido.", networkObjectId)
        : terminalMessage("Servidor web apagado.", networkObjectId);
        return;
    }

}

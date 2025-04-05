function command_apache(id, args) {

    const $networkObject = document.getElementById(id);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");

    if (!networkObjectIp || !networkObjectMac || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    if (args[1] === "on") {
        $networkObject.setAttribute("apache", "on");
        terminalMessage("Servidor web encendido correctamente.");
        return;
    }

    if (args[1] === "off") {
        $networkObject.setAttribute("apache", "off");
        terminalMessage("Servidor web apagado correctamente.");
        return;
    }

    if (args[1] === "status") {
        ($networkObject.getAttribute("apache") === "on") ? terminalMessage("Servidor web encendido.") : terminalMessage("Servidor web apagado.");
        return;
    }

}


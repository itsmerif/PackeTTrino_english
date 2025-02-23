function command_apache(id, args) {

    const $networkObject = document.getElementById(id);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const switchId = $networkObject.getAttribute("data-switch");

    if (!networkObjectIp || !networkObjectMac || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    //sintaxis: apache on 
    //sintaxis: apache off
    //sintaxis: apache -a "<html content>"

    if (args[1] === "-a") {
        
        if ($networkObject.getAttribute("web-server") !== "on") {
            terminalMessage("Error: El servidor web debe estar encendido para configurar el contenido.");
            return;
        }

        openApacheContentModal(id);
        return;

    }

    if (args[1] === "on") {

        $networkObject.setAttribute("web-server", "on");
        terminalMessage("Servidor web encendido correctamente.");
        return;

    }

    if (args[1] === "off") {

        $networkObject.setAttribute("web-server", "off");
        terminalMessage("Servidor web apagado correctamente.");
        return;

    }

    if (args[1] === "status") {

        if ($networkObject.getAttribute("web-server") === "on") {
            terminalMessage("Servidor web encendido.");
            return;
        }

        terminalMessage("Servidor web apagado.");
        return;

    }

    if (args[1] === "-c") {

        if ($networkObject.getAttribute("web-server") === "on") {
            let content = $networkObject.getAttribute("web-content");
            terminalMessage(`<pre>${content}</pre>`);
            return;
        }

        terminalMessage("El servidor web no está encendido.");
        return;

    }

    terminalMessage("Error: Sintaxis no válida -> apache [on|off|-a \"<contenido>\"]");

}

function openApacheContentModal(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");

    const modal = document.querySelector(".advanced-options-modal");
    modal.style.display = "flex";

    const form = document.querySelector(".apache-form");
    form.style.display = "flex";

}
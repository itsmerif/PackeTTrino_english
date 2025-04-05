function command_systemctl(networkObjectId, args) {

    const option = args[1];
    const service = args[2];

    const validOptions = ["start", "restart", "stop", "status"];
    const validServices = ["dhcpd", "apache", "dhclient", "dhcrelay", "resolved", "named"];

    if (!validServices.includes(service)) {
        terminalMessage("Error: Servicio no reconocido.");
        return;
    }

    if (!validOptions.includes(option)) {
        terminalMessage("Error: Opción no reconocida.");
        terminalMessage("Sintaxis: systemctl [start|restart|stop|status] &lt;nombre del servicio&gt;");
        return;
    }

    daemonManager(networkObjectId, service, option);

}

function daemonManager(networkObjectId, service, option) {

    const $networkObject = document.getElementById(networkObjectId);
    
    let daemonStatus = $networkObject.getAttribute(service);

    if (!daemonStatus) {
        terminalMessage("Error: Servicio no disponible para este equipo.");
        return;
    }

    const stateFunctions = {

        "start": () => {
            $networkObject.setAttribute(service, "true");
            terminalMessage(`${service}.service`)
            terminalMessage("Servicio Iniciado.")
        },

        "restart": () => {
            $networkObject.setAttribute(service, "true");
            terminalMessage(`${service}.service`)
            terminalMessage("Servicio Iniciado.")
        },

        "stop": () => {
            $networkObject.setAttribute(service, "false");
            terminalMessage(`${service}.service`)
            terminalMessage("Servicio Interrumpido.")
        },

        "status": () => {
            let daemonMessage = (daemonStatus === "true") ? "<span style='color:#4ade80;'> Activo (running)</span>" : "<span style='color:red;'> Inactivo (dead) </span>";
            terminalMessage(`${service}.service`)
            terminalMessage(`Status: ${daemonMessage}`);
        },

    }

    stateFunctions[option]();

}
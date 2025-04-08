function systemd(networkObjectId, service, option) {

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

function listallServices(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableServices = ["dhcpd", "apache", "dhclient", "dhcrelay", "resolved", "named"];

    availableServices.forEach(service => {

        let isServiceAvailable = $networkObject.getAttribute(service) !== null;

        if (isServiceAvailable) {
            let isServiceActive = $networkObject.getAttribute(service) === "true";
            let status = (isServiceActive) ? "<span style='color:#4ade80;'> Activo (running) </span>" : "<span style='color:red;'> Inactivo (dead) </span>";
            terminalMessage(`${(service + ".service:").padEnd(20, " ")} ${status}`);
        }

    });

}

function getactiveServices(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let availableServices = ["dhcpd", "apache", "dhclient", "dhcrelay", "resolved", "named"];
    let response = [];

    availableServices.forEach(service => {
        if ($networkObject.getAttribute(service) !== null) response.push(service);
    });

    return response;
}
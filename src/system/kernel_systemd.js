function systemd(networkObjectId, service, option) {

    const $networkObject = document.getElementById(networkObjectId);
    
    let daemonStatus = $networkObject.getAttribute(service);

    if (!daemonStatus) {
        terminalMessage("Error: Servicio no disponible para este equipo.", networkObjectId);
        return;
    }

    const stateFunctions = {

        "start": () => {
            $networkObject.setAttribute(service, "true");
            terminalMessage(`${service}.service`, networkObjectId);
            terminalMessage("Servicio Iniciado.", networkObjectId);
        },

        "restart": () => {
            $networkObject.setAttribute(service, "true");
            terminalMessage(`${service}.service`, networkObjectId);
            terminalMessage("Servicio Iniciado.", networkObjectId);
        },

        "stop": () => {
            $networkObject.setAttribute(service, "false");
            terminalMessage(`${service}.service`, networkObjectId);
            terminalMessage("Servicio Interrumpido.", networkObjectId);
        },

        "status": () => {
            let daemonMessage = (daemonStatus === "true") ? "<span style='color:#4ade80;'> Activo (running)</span>" : "<span style='color:red;'> Inactivo (dead) </span>";
            terminalMessage(`${service}.service`, networkObjectId);
            terminalMessage(`Status: ${daemonMessage}`, networkObjectId);
        },

    }

    stateFunctions[option]();

}

function listallServices(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableServices = {
        "dhcpd": "LSB: DHCP server",
        "apache": "The Apache HTTP Server",
        "dhclient": "LSB: DHCP client",
        "dhcrelay": "",
        "resolved": "",
        "named": "",
    };

    for (let service in availableServices) {

        let isServiceAvailable = $networkObject.getAttribute(service) !== null;

        if (isServiceAvailable) {
            let isServiceActive = $networkObject.getAttribute(service) === "true";
            let status = (isServiceActive) ? "active running" : "inactive dead";
            terminalMessage(`${(service + ".service").padEnd(20, " ")} loaded ${status.padEnd(20, " ")} ${availableServices[service]}`, networkObjectId);
        }

    }

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
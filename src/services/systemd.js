function systemd(networkObjectId, service, option) {

    const $networkObject = document.getElementById(networkObjectId);   
    const currentServices = ["dhcpd", "apache2", "dhclient", "dhcrelay", "resolved", "named"];
    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (!currentServices.includes(service)) throw new Error(`Error: Servicio "${service}" desconocido.`);
    if (!isServiceInstalled) throw new Error(`Error: Servicio "${service}" no instalado.`);

    const stateFunctions = {

        "start": () => startService(networkObjectId, service),

        "restart": () => {
            $networkObject.setAttribute(service, "false");
            startService(networkObjectId, service);
        },

        "stop": () => {
            $networkObject.setAttribute(service, "false");
        },

        "status": () => {
            const serviceStatus = $networkObject.getAttribute(service) === "true";
            let daemonMessage = (serviceStatus) ? "<span style='color:#4ade80;'> Activo (running)</span>" : "<span style='color:red;'> Inactivo (dead) </span>";
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
        "apache2": "The Apache HTTP Server",
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

function getAvailableServices(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    let availableServices = ["dhcpd", "apache2", "dhclient", "dhcrelay", "resolved", "named"];
    let response = [];

    availableServices.forEach(service => {
        if ($networkObject.getAttribute(service) !== null) response.push(service);
    });

    return response;
}

function startService(networkObjectId, service) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkElementFileSystem = new FileSystem($networkObject);

    const startFunctions = {        

        "dhcpd": () => {
            $networkObject.setAttribute("dhcpd", "true");
            let dhcpdContent = networkElementFileSystem.read("dhcpd.conf", ["etc", "dhcp"]);
            dhcpdFileInterpreter(networkObjectId, dhcpdContent);
        },

        "dhclient": () => {
            $networkObject.setAttribute("dhclient", "true");
        },

        "apache2": () => {
            $networkObject.setAttribute("apache", "true");
        },

        "dhcrelay": () => {
            $networkObject.setAttribute("dhcrelay", "true");
        },

        "named": () => {
            $networkObject.setAttribute("named", "true");
        },

        "resolved": () => {
            $networkObject.setAttribute("resolved", "true");
        },
    }

    startFunctions[service]();

}
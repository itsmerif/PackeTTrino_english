function command_systemctl(networkObjectId, args) {

    const option = args[1];

    const validOptions = ["start", "restart", "stop", "status"];
    
    const service = args[2];

    const systemctlFunctions = {
        "dhcpd": () => daemonDhcpd(networkObjectId, option),
        "apache": () => daemonApache(networkObjectId, option),
        "dhclient": () => daemonDhclient(networkObjectId, option),
        "rsyslog": () => daemonRsyslog(networkObjectId, option),
    }
    
    if (!validOptions.includes(option)) {
        terminalMessage("Error: opción no reconocida");
        terminalMessage("Sintaxis: systemctl [start|restart|stop|status] &lt;nombre del servicio&gt;");
        return;
    }

    (service in systemctlFunctions) ? systemctlFunctions[service]() : terminalMessage("Error: servicio desconocido.")
}

function daemonDhcpd(networkObjectId, option) {

    if (!networkObjectId.startsWith("dhcp-server-")) {
        terminalMessage("Error: Servicio No disponible para este equipo.");
        return;
    }

}

function daemonApache(networkObjectId, option) {

    if (!networkObjectId.startsWith("pc-")) {
        terminalMessage("Error: Servicio No disponible para este equipo.");
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    
    const apacheFunctions = {

        "start": () => {
            $networkObject.setAttribute("web-server", "on");
            terminalMessage("apache2.service - The Apache HTTP Server")
            terminalMessage("Servicio de Apache Iniciado.")
        },
        
        "restart": () => {
            $networkObject.setAttribute("web-server", "on");
            terminalMessage("apache2.service - The Apache HTTP Server")
            terminalMessage("Servicio de Apache Reiniciado.")
        },

        "stop": () => {
            $networkObject.setAttribute("web-server", "off");
            terminalMessage("apache2.service - The Apache HTTP Server")
            terminalMessage("Servicio de Apache Interrumpido.")
        },

        "status": () => {
            let statusApache = ($networkObject.getAttribute("web-server") === "on") 
            ? "<span style='color:#4ade80;'> Activo (running)</span>"
            : "<span style='color:red;'> Inactivo (dead) </span>";
            terminalMessage("apache2.service - The Apache HTTP Server")
            terminalMessage(`Status: ${statusApache}`);
        },
    }

    apacheFunctions[option]();
}
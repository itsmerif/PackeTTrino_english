function command_systemctl(networkObjectId, args) {

    const option = args[1];
    const service = args[2];

    const validOptions = ["start", "restart", "stop", "status", "list-units"];
    const validServices = ["dhcpd", "apache", "dhclient", "dhcrelay", "resolved", "named"];

    if (!validOptions.includes(option)) {
        terminalMessage("Error: Opción no reconocida.");
        terminalMessage("Sintaxis: systemctl [start|restart|stop|status] &lt;nombre del servicio&gt;");
        return;
    }

    if (option === "list-units") {
        listallServices(networkObjectId);
        return;
    };

    if (!validServices.includes(service)) {
        terminalMessage("Error: Servicio no reconocido.");
        return;
    }

    systemd(networkObjectId, service, option);

}
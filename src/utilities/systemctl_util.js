function command_systemctl(networkObjectId, args) {

    const option = args[1];
    const service = args[2];

    const validOptions = ["start", "restart", "stop", "status", "list-units"];
    
    if (!validOptions.includes(option)) {
        terminalMessage("Error: Opción no reconocida.", networkObjectId);
        terminalMessage("Sintaxis: systemctl [start|restart|stop|status] &lt;nombre del servicio&gt;", networkObjectId);
        return;
    }

    if (option === "list-units") {
        listallServices(networkObjectId);
        return;
    };

    try {
        systemd(networkObjectId, service, option);
    } catch (e) {
        terminalMessage(e.message, networkObjectId);
    }

}
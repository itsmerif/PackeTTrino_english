function command_systemctl(networkObjectId, args) {

    const option = args[1];
    const service = args[2];

    const validOptions = ["start", "restart", "stop", "status", "list-units"];
    
    if (!validOptions.includes(option)) {
        terminalMessage("Error: Unrecognized option.", networkObjectId);
        terminalMessage("Syntax: systemctl [start|restart|stop|status] &lt;service name&gt;", networkObjectId);
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

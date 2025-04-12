function command_Apt(networkObjectId, args) {
    
    const options = ["install", "remove"];
    const availablePackages = ["apache2", "bind9", "isc-dhcp-server", "isc-dhcp-relay", "isc-dhcp-client"];

    if (args.length !== 3) {
        terminalMessage("Error de argumentos: Sintaxis: apt [install|remove] &lt;nombre del paquete&gt;");
        return;
    }

    if (!options.includes(args[1])) {
        terminalMessage("Error: Opción no reconocida.");
        return;
    }

    if (!availablePackages.includes(args[2])) {
        terminalMessage(`Error: El paquete ${args[2]} no se reconoce.`);
        return;
    }


    dpkg(networkObjectId, args[1], args[2]);

}
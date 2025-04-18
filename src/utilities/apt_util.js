function command_apt(networkObjectId, args) {

    const option =  args[1];
    const package = args[2];
    const availableOptions = ["install", "remove"];

    if (args.length !== 3) {
        terminalMessage("Error de argumentos: Sintaxis: apt [install|remove] &lt;nombre del paquete&gt;", networkObjectId);
    }

    if (!availableOptions.includes(args[1])) {
        terminalMessage("Error: Opción no reconocida.", networkObjectId);
    }

    try {
        dpkg(networkObjectId, option, package);
    }catch(error) {
        terminalMessage(error.message, networkObjectId);
    }
    
}
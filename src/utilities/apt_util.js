function command_apt(networkObjectId, args) {

    const option =  args[1];
    const package = args[2];
    const availableOptions = ["install", "remove"];

    if (args.length !== 3) {
        terminalMessage("Error de argumentos: Sintaxis: apt [install|remove] &lt;nombre del paquete&gt;", networkObjectId);
        return;
    }

    if (!availableOptions.includes(args[1])) {
        terminalMessage("Error: Opción no reconocida.", networkObjectId);
        return;
    }

    let log = dpkg(networkObjectId, option, package);

    return log;

}
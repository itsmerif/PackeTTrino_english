function command_dig(dataId, args) {

    // sintaxis: dig <domain>

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis -> dig <domain>");
        return;
    }

    terminalMessage("Buscando información de dominio...");

    dig(dataId, args[1], true);

}
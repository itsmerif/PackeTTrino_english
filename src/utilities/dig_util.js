async function command_dig(dataId, args) {

    let opt_x = false;
    let opt_t = false;
    let opt_server = false;
    let domain;
    let dnsServer = "";
    let query_type = "A";
    const validTypes = ["A", "SOA", "PTR", "NS", "AAAA", "MX"];

    let $OPTS = catchopts(["-x", "-t:", "@:"], args);

    for (option in $OPTS) {
        switch (option) {
            case "-x":
                opt_x = true;
                query_type = "PTR";
                break;
            case "-t":
                opt_t = true;
                query_type = $OPTS["-t"];
                break;
            case "@":
                opt_server = true;
                dnsServer = $OPTS["@"];
                break;
        }
    }

    args = args.slice($OPTS['IND'] + 1)

    if (args.length === 0) {
        terminalMessage("Error: falta el argumento dominio o ip.");
        return;
    }

    domain = args[0];

    if (opt_t && !validTypes.includes(query_type)) {
        terminalMessage("Error: tipo de registro desconocido.")
        return;
    }

    if (!opt_x && !isValidDomain(domain)) {
        terminalMessage("Error: el dominio no es válido.");
        return;
    }

    if (opt_x && !isValidIp(domain)) {
        terminalMessage("Error: ip no válida para la consulta inversa.");
        return;
    }

    if (opt_server && !isValidIp(dnsServer)) {
        terminalMessage("Error: ip del servidor no válida.");
        return;
    }

    if (visualToggle) await minimizeTerminal();

    try {

        cleanPacketTraffic();

        await getDomainFromServer(dataId, domain, true, dnsServer, query_type, true);

    } catch (error) {

        console.log(error);

    }

    if (visualToggle) await maximizeTerminal();
}
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
        terminalMessage("Error: falta el argumento dominio o ip.", dataId);
        return;
    }

    domain = args[0];

    if (opt_t && !validTypes.includes(query_type)) {
        terminalMessage("Error: tipo de registro desconocido.", dataId);
        return;
    }

    if (!opt_x && !isValidDomain(domain)) {
        terminalMessage("Error: el dominio no es válido.", dataId);
        return;
    }

    if (opt_x && !isValidIp(domain)) {
        terminalMessage("Error: ip no válida para la consulta inversa.", dataId);
        return;
    }

    if (opt_server && !isValidIp(dnsServer)) {
        terminalMessage("Error: ip del servidor no válida.", dataId);
        return;
    }

    cleanPacketTraffic();
    if (visualToggle) await minimizeTerminal();
    await dig(dataId, domain, query_type, dnsServer);
    if (visualToggle) await maximizeTerminal();
}

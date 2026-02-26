async function command_dig(networkObjectId, args) {

    let opt_x = false;
    let opt_t = false;
    let opt_server = false;
    let domain;
    let dnsServer = "";
    let query_type = "A";
    const validRecordTypes = ["A", "SOA", "PTR", "NS", "AAAA", "MX"];

    let $OPTS = catchopts(["-x", "-t:", "@:"], args);

    const optionsHandler = {
        "-x": () => { opt_x = true; query_type = "PTR"; },
        "-t": () => { opt_t = true; query_type = $OPTS["-t"].toUpperCase(); },
        "@": () => { opt_server = true; dnsServer = $OPTS["@"]; }
    }

    for (option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();

    args = args.slice($OPTS['IND'] + 1) //<-- saltamos a los argumentos que no son opciones

    if (args.length === 0) {
        terminalMessage("Error: Missing domain or IP address argument.", networkObjectId);
        return;
    }

    domain = args[0]; //<-- el primer argumento es el dominio

    if (opt_t && !validRecordTypes.includes(query_type)) { //<-- si se especifica el tipo de consulta, se comprueba que sea un tipo válido
        terminalMessage("Error: Unknown record type.", networkObjectId);
        return;
    }

    if (!opt_x && !isValidDomain(domain)) { //<-- si no se especifica el tipo de consulta, se asume que debe ser un dominio válido
        terminalMessage("Error: Invalid domain.", networkObjectId);
        return;
    }

    if (opt_x && !isValidIp(domain)) { //<-- si se especifica el tipo de consulta como PTR, se comprueba que sea una ip válida
        terminalMessage("Error: Invalid IP address for reverse lookup.", networkObjectId);
        return;
    }

    if (opt_server && !isValidIp(dnsServer)) { //<-- si se especifica un servidor dns, se comprueba que sea una ip válida
        terminalMessage("Error: Invalid server IP.", networkObjectId);
        return;
    }

    if (visualToggle) await minimizeTerminal();

        try {

            const dnsReply = await getDomainFromServer(
                networkObjectId,
                domain, //dominio
                dnsServer, //ip del servidor
                query_type, //tipo de registro
            );
            
            generateDnsOuput(dnsReply, networkObjectId);

        } catch (error) {

            console.log(error);
            terminalMessage(error.message, networkObjectId);

        }

    if (visualToggle) await maximizeTerminal();

}

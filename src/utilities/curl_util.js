async function command_curl(networkObjectId, args) {

    //comprobación de opciones

    const $OPTS = catchopts([
        "-m:",
        "-h",
    ], args);

    const optionHandlers = {
        "-m": () => { method = ($OPTS["-m"]).trim(); },
        "-h": () => { showHeaders = true; }
    }

    let method = "GET";
    let showHeaders = false;

    for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

    args = args.slice($OPTS['IND'] + 1)

    //comprobación de argumentos

    const url = args[0];

    if (!url) {
        terminalMessage("Error: No se ha especificado la URL.", networkObjectId);
        return;
    }

    if (visualToggle) await minimizeTerminal();

        try {

            const search = parseSearch(url);

            const requestFunctions = {
                "http": async () => {
                    return http(networkObjectId, {
                        address: search.address,
                        method: "GET",
                        dport: search.port,
                        resource: search.resource
                    });
                }
            };

            if (!requestFunctions[search.protocol]) throw new Error(`Protocolo ${search.protocol} no válido.`); 

            const httpReply = await requestFunctions[search.protocol]();
            
            let message = `URL:\n ${search.protocol}://${search.address}:${search.port}\n\n`;

            if (showHeaders) {
                message += `Status Code:\n ${httpReply.statusCode}\n\n`;
                message += `Method:\n ${httpReply.method}\n\n`;
                message += `Host:\n ${httpReply.host}\n\n`;
                message += `Content-Type:\n ${httpReply.contentType}\n\n`;
                message += `Keep-Alive:\n ${httpReply.keepalive}\n\n`;
                message += `User-Agent:\n ${httpReply.userAgent}\n\n`;
            }

            message += `Body:\n ${httpReply.body}`;

            terminalMessage(message, networkObjectId, false);

        } catch (error) {

            terminalMessage(`curl: ${error.message}`, networkObjectId);

        }

    if (visualToggle) await maximizeTerminal();

}
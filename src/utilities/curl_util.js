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

    const [protocol, address, port] = parseSearch(url);

    if (visualToggle) await minimizeTerminal();

        try {

            const httpReply = await http(networkObjectId, address, method, port); 
            
            let message = `URL:\n ${protocol}://${address}:${port}\n\n`;

            if (showHeaders) {
                message += `Method:\n ${httpReply.method}\n\n`;
                message += `Host:\n ${httpReply.host}\n\n`;
                message += `Content-Type:\n ${httpReply.contentType}\n\n`;
                message += `Keep-Alive:\n ${httpReply.keepalive}\n\n`;
                message += `User-Agent:\n ${httpReply.userAgent}\n\n`;
            }

            message += `Body:\n ${httpReply.body}`;

            terminalMessage(message, networkObjectId, false);

        } catch (error) {

            console.log(error);
            terminalMessage(`curl: ${error.message}`, networkObjectId);

        }

    if (visualToggle) await maximizeTerminal();

}
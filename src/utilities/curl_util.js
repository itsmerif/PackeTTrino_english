async function command_curl(networkObjectId, args) {

    //comprobación de opciones

    const $OPTS = catchopts([
        "-m:",
    ], args);

    const optionHandlers = {
        "-m": () => { method = ($OPTS["-m"]).trim(); },
    }

    let method = "GET"; 

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
            message += `Method:\n ${method.toUpperCase()}\n\n`;
            message += `Headers:\n ${httpReply.header}\n\n`;
            message += `Body:\n ${httpReply.body}`;

            terminalMessage(message, networkObjectId, false);

        } catch (error) {

            terminalMessage(`curl: ${error.message}`, networkObjectId);

        }

    if (visualToggle) await maximizeTerminal();

}
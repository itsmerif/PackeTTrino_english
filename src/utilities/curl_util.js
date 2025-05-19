async function command_curl(networkObjectId, url) {

    const [protocol, address, port] = parseSearch(url);
    let message = `URL:\n ${protocol}://${address}:${port}\n\n`;

    try {

        const httpReply = await http(networkObjectId, address, "GET", port);
       
        message += `Headers:\n ${httpReply.header}\n\n`;
        message += `Body:\n ${httpReply.body}`;

        terminalMessage(message, networkObjectId, false);

    } catch (error) {

        terminalMessage(error.message, networkObjectId);

    }

}
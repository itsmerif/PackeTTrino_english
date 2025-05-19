async function command_curl(networkObjectId, destination) {

    try {
        const webContent = await http(networkObjectId, destination);
        terminalMessage(webContent, networkObjectId, false);
    } catch (error) {
        terminalMessage(error.message, networkObjectId);
    }

}
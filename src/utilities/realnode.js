function command_realnode(networkObjectId, properties) {
    const $networkObject = document.getElementById(networkObjectId);
    properties.forEach(property => {
        const value = $networkObject.getAttribute(property) || "No value found";
        terminalMessage(`${property}: ${value}`, networkObjectId, false);
    });
}
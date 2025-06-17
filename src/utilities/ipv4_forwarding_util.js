function command_ipv4_forwarding(networkObjectId, options) {

    const $networkObject = document.getElementById(networkObjectId);

    if (options.length === 0) {
        const state = ($networkObject.getAttribute("ipv4-forwarding") === "true") ? "Activo (ON)" : "Desactivado (OFF)";
        terminalMessage(`ipv4-forwarding: State: ${state}`, networkObjectId);
        return;
    }

    $networkObject.setAttribute("ipv4-forwarding", 
        (options[0] === "on") 
            ? "true" 
            : (options[0] === "off") 
                ? "false" 
                : terminalMessage(`ipv4-forwarding: Error: opción no reconocida.`, networkObjectId)
    );

}
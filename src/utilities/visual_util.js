function command_visual(networkObjectId, args) {

    const $OPTS = catchopts([
        "speed:",
        "off",
        "on",
        "config",
    ], args);

    const optionsHandler = {
        "speed": () => { newVisualSpeed = parseInt($OPTS["speed"]); },
        "off": () => { newVisualMode = "OFF"; },
        "on": () => { newVisualMode = "ON"; },
        "config": () => { 
            terminalMessage(`Velocidad de animación: ${visualSpeed} ms`, networkObjectId);
            terminalMessage(`Modo de animación: ${(visualToggle ? "ON" : "OFF")}`, networkObjectId);
        },
    }

    let newVisualSpeed = visualSpeed;
    let newVisualMode = visualToggle ? "ON" : "OFF";

    for (let option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();

    if (isNaN(newVisualSpeed) || newVisualSpeed > 1000 || newVisualSpeed < 100) {
        terminalMessage("Error: velocidad de animación no válida.", networkObjectId);
        return;
    }

    visualSpeed = newVisualSpeed;
    visualToggle = newVisualMode === "ON";

}
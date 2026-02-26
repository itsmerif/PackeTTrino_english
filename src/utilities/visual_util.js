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
            terminalMessage(`Animation speed: ${visualSpeed} ms`, networkObjectId);
            terminalMessage(`Animation mode: ${(visualToggle ? "ON" : "OFF")}`, networkObjectId);
        },
    }

    let newVisualSpeed = visualSpeed;
    let newVisualMode = visualToggle ? "ON" : "OFF";

    for (let option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();

    if (isNaN(newVisualSpeed) || newVisualSpeed > 1000 || newVisualSpeed < 100) {
        terminalMessage("Error: Invalid animation speed.", networkObjectId);
        return;
    }

    visualSpeed = newVisualSpeed;
    visualToggle = newVisualMode === "ON";

}

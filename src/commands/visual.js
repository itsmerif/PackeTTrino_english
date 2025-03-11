function command_visual(args) {

    if (args[1] === "on") {
        visualToggle = true;
        terminalMessage(`<p>Visual mode: ON</p>`);
        return;
    }

    if (args[1] === "off") {
        visualToggle = false;
        terminalMessage(`<p>Visual mode: OFF</p>`);
        return;
    }

    if (args[1] === "speed") {
        visualSpeed = parseInt(args[2], 10);
        terminalMessage(`<p>Visual speed: ${visualSpeed}ms</p>`);
        return;
    }
}
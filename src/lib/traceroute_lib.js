function traceRouteFail(origin, seq, numeric = false) {
    if (document.querySelector(".terminal-component").style.display === "none") return;
    seq = numeric ? seq + 1 : "";
    terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n");
    window.pingInterval = setInterval(() => {
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + `*               *\n`);
    }, 500);
}

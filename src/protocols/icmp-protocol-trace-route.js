let stopTrace = false;

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "c") {
        stopTrace = true;
    }
});

async function command_Traceroute(args, originIP) {

    if (args.length > 3) {
        terminalMessage("Error: Sintaxis: traceroute <ip> [-debug]");
        return;
    }

    if (!args[1].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
        terminalMessage("Error: La IP de destino introducida no es válida.");
        return;
    }

    const packet = {
        origin: originIP,
        destination: args[1],
        protocol: "icmp",
        ttl: 64,
        type: "echo-request",
        code: 0
    };

    try {
        let trace = sendPacket(packet);
        let hop = 1;

        for (let i = 0; i < trace.length - 1; i++) {
            if (stopTrace) break; // Detiene el bucle si se presiona Ctrl + C
            let text = hop + ". " + trace[i].padEnd(15) + " " + trace[i + 1];
            terminalMessage(text);
            hop++;
            await sleep(500);
        }

    } catch (error) {

        let trace = error.trace;
        let hop = 1;

        if (args[2] === "-debug") {
            terminalMessage(error.message);
            await sleep(500);
        }

        for (let i = 0; i < trace.length - 1; i++) {
            if (stopTrace) break;
            let text = hop + ". " + trace[i].padEnd(15) + " " + trace[i + 1];
            terminalMessage(text);
            hop++;
            await sleep(500);
        }

        window.pingInterval = setInterval(() => {
            if (stopTrace) {
                clearInterval(window.pingInterval);
                return;
            }
            terminalMessage(hop + ". " + "*".padEnd(15) + " *");
            hop++;
        }, 500);

        stopTrace = false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
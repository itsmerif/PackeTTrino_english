function command_Traceroute(args, originIP) {

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
            let text = hop + ". " + trace[i].padEnd(15) + " " + trace[i + 1];
            terminalMessage(text);
            hop++;
        }

    } catch (error) {

        let trace = error.trace;
        let hop = 1;

        if (args[2] === "-debug") {
            terminalMessage(error.message);
        }

        for (let i = 0; i < trace.length - 1; i++) {
            let text = hop + ". " + trace[i].padEnd(15) + " " + trace[i + 1];
            terminalMessage(text);
            hop++;
        }

        window.pingInterval = setInterval(() => {
            terminalMessage(hop + ". " + "*".padEnd(15) + " *");
            hop++;
        }, 500);

    }

}

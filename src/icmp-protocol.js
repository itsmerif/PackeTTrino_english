function command_Ping(dataId, args, originIP) {

    if (dataId.includes("router-")) { //por ahora solo se puede hacer ping desde un pc
        terminalMessage("Error: Este comando solo puede ser ejecutado desde un pc.");
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping <ip>");
        return;
    }

    if (!args[1].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
        terminalMessage("Error: La IP de destino introducida no es válida.");
        return;
    }

    //genero el paquete

    const packet = {
        origin: originIP,
        destination: args[1],
        protocol: "icmp",
        ttl: 64,
        type: "echo-request",
        code: 0
    };

    ping(packet);
    return;

}

function ping(packet) {

    try {

        sendPacket(packet); //echo request

        try { //si sale bien, pedimos la respuesta

            const newpacket = {
                origin: packet.destination,
                destination: packet.origin,
                protocol: "icmp",
                ttl: 64,
                type: "echo-reply",
                code: 0
            }

            sendPacket(newpacket); //echo reply
            ping_s(packet.origin);

        }catch (error) {

            console.log("vuelta: " + error);
            ping_f(packet.origin);

        }

    } catch (error) {

        console.log("ida: " + error);
        ping_f(packet.origin);

    }

}

function ping_s(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=1 ttl=64 time=0.030 ms\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 500);

}

function ping_f(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `From ${origin} icmp_seq=1 Destination Host Unreachable\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 500);

}

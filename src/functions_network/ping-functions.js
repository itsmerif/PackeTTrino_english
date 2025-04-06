async function command_ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping  &lt;ip | dominio&gt;");
        return;
    }

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("ping: connect: La red es inaccesible.");
        return;
    }

    await ping(dataId, args);

}

async function ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const switchObjectId = $networkObject.getAttribute("data-switch");
    let destination = args[1];

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    if (!isValidIp(destination)) {

        destination = await domainNameResolution(dataId, args[1]);

        if (!destination) {
            if (visualToggle) await maximizeTerminal();
            terminalMessage(`ping: ${destination}: Nombre o servicio desconocido`)
            return;
        }

    }

    if (destination === getNetwork(destination, networkObjectNetmask)) {
        if (visualToggle) await maximizeTerminal();
        pingFailure(destination);
        return;
    }

    if (destination === networkObjectIp || getNetwork(destination, "255.0.0.0") === "127.0.0.0") {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (visualToggle) await maximizeTerminal();
        pingSuccess(destination);
        return;
    }

    try {

        icmpFlag = false;
        await icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, destination);

    } catch (error) {

        if (visualToggle) await maximizeTerminal();
        pingFailure(destination);
        return;

    }

    if (!icmpFlag) pingFailure(destination);
    else pingSuccess(destination);

    if (visualToggle) await maximizeTerminal();

}

function pingSuccess(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (terminal.style.display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=1 ttl=64 time=0.030 ms\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 500);

}

function pingFailure(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (terminal.style.display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `From ${origin} icmp_seq=1 Destination Host Unreachable\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 500);
}

async function pingSimulator(originIp, destinationIp) {

    visualToggle = true;

    const $networkObject = document.querySelector(`[data-ip='${originIp}']`)
        || document.querySelector(`[ip-enp0s3='${originIp}']`)
        || document.querySelector(`[ip-enp0s8='${originIp}']`)
        || document.querySelector(`[ip-enp0s9='${originIp}']`);

    if (!$networkObject) return;
    
    await command_ping($networkObject.id, ["ping", destinationIp]);

}
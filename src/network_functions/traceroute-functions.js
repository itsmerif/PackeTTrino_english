function command_traceroute(dataId, args) {

    //gestion de entrada

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: traceroute {ip}");
        return;
    }

    if (!isValidIp(args[1])) {
        terminalMessage("Error: La IP introducida no es válida.");
        return;
    }

    //gestion de equipo

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const switchObjectId = $networkObject.getAttribute("data-switch");

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    if (!switchObjectId) {
        return;
    }

    if (networkObjectIp === args[1]) {
        return;
    }


    //ejecucion

    traceroute(dataId, args[1]);

}

async function traceroute(dataId, destination) {
    cleanPacketTraffic()
    trace = true; //se activa el traceroute
    traceFlag = false; //ponemos a falso el flag de traceroute

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let packet = new IcmpEchoRequest(networkObjectIp, destination, networkObjectMac, "");

    packet.ttl = 1;

    traceBuffer = [networkObjectIp];

    await customPacketGenerator(dataId, packet);

    while (traceReturn) {
        terminalMessage(traceBuffer[traceBuffer.length - 2].toString().padEnd(15," ") + traceBuffer[traceBuffer.length - 1].toString());
        traceReturn = false;
        packet.ttl++;
        await customPacketGenerator(dataId, packet);
    }

    if (traceFlag) {
        terminalMessage(traceBuffer[traceBuffer.length - 2].toString().padEnd(15," ") + traceBuffer[traceBuffer.length - 1].toString());
    } else {
        traceRouteFail(traceBuffer[traceBuffer.length - 1]);
    }

    trace = false; //desactivamos el traceroute
}

function traceRouteFail(origin) {
    const terminal = document.querySelector(".pc-terminal");
    if (terminal.style.display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += origin.toString().padEnd(15," ") + " *\n";
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `*               *\n`;
        seq++;
    }, 500);
}
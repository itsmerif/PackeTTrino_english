function command_traceroute(dataId, args) {

    //gestion de equipo

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    //gestion de entrada

    switch (args.length) {
        case 2:
            traceroute(dataId, args[1]);
            break;
        case 3:
            if (args[1] === "-n") {
                traceroute(dataId, args[2], true);
            } else {
                terminalMessage("Error: sintaxis: traceroute [-n] destino");
            }
            break;
        default:
            terminalMessage("Error: sintaxis: traceroute [-n] destino");
            return;
    }

}

async function traceroute(dataId, destination, numeric = false) {

    cleanPacketTraffic()
    
    trace = true; //se activa el traceroute
    traceFlag = false; //ponemos a falso el flag de traceroute

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let hops = numeric ? 1 : "";

    //generamos el primer paquete

    let packet = new IcmpEchoRequest(networkObjectIp, destination, networkObjectMac, "");
    packet.ttl = 1;
    traceBuffer = [networkObjectIp]; //se agrega el origen al buffer de traceroute

    await customPacketGenerator(dataId, packet);

    while (traceReturn) {
        terminalMessage(hops + " " + traceBuffer[traceBuffer.length - 2].toString().padEnd(15," ") + traceBuffer[traceBuffer.length - 1].toString());
        traceReturn = false;
        packet.ttl++;
        hops = numeric ? hops + 1 : "";
        await customPacketGenerator(dataId, packet);
    }

    if (traceFlag) {
        terminalMessage(hops + " " + traceBuffer[traceBuffer.length - 2].toString().padEnd(15," ") + traceBuffer[traceBuffer.length - 1].toString());
    } else {
        traceRouteFail(traceBuffer[traceBuffer.length - 1], hops, numeric);
    }

    trace = false; //desactivamos el traceroute
}

function traceRouteFail(origin, seq, numeric = false) {
    if (document.querySelector(".pc-terminal").style.display === "none") return;
    seq = numeric ? seq + 1 : "";
    terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n");
    window.pingInterval = setInterval(() => {
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + `*               *\n`);
    }, 500);
}
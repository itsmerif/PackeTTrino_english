async function traceroute(dataId, destination, numeric = false) {

    cleanPacketTraffic()
    
    trace = true; //se activa el traceroute
    traceFlag = false; //ponemos a falso el flag de traceroute

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let hops = numeric ? 1 : "";


    if (visualToggle) await minimizeTerminal();

    //comprobamos si el destino es una ip o un nombre de dominio

    if (!isValidIp(destination)) {
        try {
            await dig(dataId, destination, false);
            destination = isDomainInCachePc(dataId, destination)[1];
        }catch (error) {
            terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            return;
        }
    }

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

    if (visualToggle) await maximizeTerminal();

    if (traceFlag) {
        terminalMessage(hops + " " + traceBuffer[traceBuffer.length - 2].toString().padEnd(15," ") + traceBuffer[traceBuffer.length - 1].toString());
    } else {
        traceRouteFail(traceBuffer[traceBuffer.length - 1], hops, numeric);
    }

    trace = false; //desactivamos el traceroute
}

function traceRouteFail(origin, seq, numeric = false) {
    if (document.querySelector(".terminal-component").style.display === "none") return;
    seq = numeric ? seq + 1 : "";
    terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n");
    window.pingInterval = setInterval(() => {
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + `*               *\n`);
    }, 500);
}
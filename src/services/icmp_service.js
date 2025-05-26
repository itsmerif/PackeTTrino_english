async function ping(networkObjectId, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);

    if (!networkObjectIp || !networkObjectNetmask) return 4;

    if (!isValidIp(destination)) {
        destination = await domainNameResolution(networkObjectId, destination);
        if (!destination) return 1;
    }

    if (isLocalIp(networkObjectId, destination)) {
        await new Promise(resolve => setTimeout(resolve, 50)); //<-- esta promesa esta aquí para que la terminal visualmente no se "buguee"
        return 0;
    }

    if (destination === getNetwork(destination, networkObjectNetmask)) return 2;

    icmpFlag[networkObjectId] = false;

    try {       
        await icmpRequestPacketGenerator(networkObjectId, networkObjectIp, destination, networkObjectInterface);
    } catch (error) {
        return 3;
    }

    if (icmpFlag[networkObjectId] === false) return 3;
    else return 0;

}

async function traceroute(networkObjectId, destination, numeric = false) {
    
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);

    let hops = numeric ? 1 : "";

    if (!isValidIp(destination)) {
        const domainName = destination;
        destination = await domainNameResolution(networkObjectId, destination);
        if (!destination) {
            terminalMessage(`traceroute: Nombre "${domainName}" o servicio desconocido.`, networkObjectId);
            return;
        }
    }

    if (isLocalIp(networkObjectId, destination)) {
        await new Promise(resolve => setTimeout(resolve, 50)); //<-- esta promesa esta aquí para que la terminal visualmente no se "buguee"
        return;
    }

    trace[networkObjectId] = true; //<-- activamos el modo de trazado
    traceFlag[networkObjectId] = false;

    let packet = new IcmpEchoRequest(
        networkObjectIp, //ip de origen
        destination, //ip de destino
        networkObjectMac, //mac de origen
        "" //mac de destino
    );

    packet.ttl = 1; //el TTL inicial es 1

    traceBuffer[networkObjectId] = [networkObjectIp]; //el punto de partida es la IP del objeto
    traceReturn[networkObjectId] = false;

    await routing(networkObjectId, packet, true);

    while (traceReturn[networkObjectId] === true) {
        //construimos y mostramos el mensaje de salida
        let message = `${hops}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 2].toString().padEnd(15," ")}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 1].toString()}`;
        terminalMessage(message, networkObjectId);
        //limpiamos el buffer de mensajes de salida
        traceReturn[networkObjectId] = false;
        //aumentamos el TTL y enviamos el paquete de nuevo
        packet.ttl++;
        hops = (numeric) ? hops + 1 : "";
        await routing(networkObjectId, packet, true);
    }

    if (traceFlag[networkObjectId] === true) {
        let message = `${hops}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 2].toString().padEnd(15," ")}`;
        message +=` ${traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 1].toString()}`;
        terminalMessage(message, networkObjectId);
    } else {
        traceRouteFail(traceBuffer[networkObjectId][traceBuffer[networkObjectId].length - 1], hops, numeric);
    }

    trace[networkObjectId] = false; //<-- desactivamos el modo de trazado

    function traceRouteFail(origin, seq, numeric = false) {
        if (document.querySelector(".terminal-component").style.display === "none") return;
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n", networkObjectId);
        window.pingInterval = setInterval(() => {
            seq = numeric ? seq + 1 : "";
            terminalMessage(seq + " " + `*               *\n`, networkObjectId);
        }, 500);
    }

}

async function icmpRequestPacketGenerator(networkObjectId, originIp, destinationIp, iface = "enp0s3") {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${iface}`);
    let packet = new IcmpEchoRequest(originIp, destinationIp, networkObjectMac, "");
    await routing(networkObjectId, packet, true);
}

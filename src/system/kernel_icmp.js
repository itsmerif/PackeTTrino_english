async function ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const switchObjectId = $networkObject.getAttribute("data-switch-enp0s3");
    let destination = args[1];

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    if (!isValidIp(destination)) {

        const domain = destination;
        destination = await domainNameResolution(dataId, args[1]);

        if (!destination) {
            if (visualToggle) await maximizeTerminal();
            terminalMessage(`ping: ${domain}: Nombre o servicio desconocido`)
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

async function traceroute(dataId, destination, numeric = false) {

    cleanPacketTraffic()
    
    trace = true; //se activa el traceroute
    traceFlag = false; //ponemos a falso el flag de traceroute

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
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

async function icmpRequestPacketGenerator(networkObjectId, switchId, originIp, destinationIp) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectNetmask =  $networkObject.getAttribute("netmask-enp0s3");
    const isSameNetwork = getNetwork(originIp, networkObjectNetmask) === getNetwork(destinationIp, networkObjectNetmask);
    const isRouter = networkObjectId.startsWith("router-");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3"); 
    let packet = new IcmpEchoRequest(originIp, destinationIp, networkObjectMac, "");
    let destination_mac;

    if (!isSameNetwork) { 
        
        if (!isRouter) {

            const defaultGateway = $networkObject.getAttribute("data-gateway");
            if (!defaultGateway) throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");          
            const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
    
            if (!defaultGatewayMac) {
                buffer[networkObjectId] = packet;
                await arpResolve(networkObjectId, defaultGateway);
                return;
            }
    
            packet.destination_mac = defaultGatewayMac;
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;

        } else {

            await routing(networkObjectId, packet);
            return;

        }

    }

    destination_mac = isIpInARPTable(networkObjectId, destinationIp);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, destinationIp);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
async function ping(dataId, destination) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");

    if (!isValidIp(destination)) {
        destination = await domainNameResolution(dataId, destination);
        if (!destination) return 1;
    }

    if (destination === getNetwork(destination, networkObjectNetmask)) return 2;

    if (destination === networkObjectIp || getNetwork(destination, "255.0.0.0") === "127.0.0.0") {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 0;
    }

    icmpFlag[dataId] = false;

    try {
        await icmpRequestPacketGenerator(dataId, networkObjectIp, destination);
    } catch (error) {
        console.log(error);
        return 3;
    }

    if (icmpFlag[dataId] === false) return 3;
    else return 0;

}

async function traceroute(dataId, destination, numeric = false) {
    
    trace[dataId] = true;
    traceFlag[dataId] = false;

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    let hops = numeric ? 1 : "";

    if (!isValidIp(destination)) {
        destination = await domainNameResolution(dataId, destination);
        if (!destination) return 1;
    }

    let packet = new IcmpEchoRequest(networkObjectIp, destination, networkObjectMac, "");
    packet.ttl = 1;

    traceBuffer[dataId] = [networkObjectIp];
    traceReturn[dataId] = false;

    await customPacketGenerator(dataId, packet);

    while (traceReturn[dataId] === true) {
        terminalMessage(
            hops + " " + 
            traceBuffer[dataId][traceBuffer[dataId].length - 2].toString().padEnd(15," ") + 
            traceBuffer[dataId][traceBuffer[dataId].length - 1].toString(),
        dataId);
        traceReturn[dataId] = false;
        packet.ttl++;
        hops = numeric ? hops + 1 : "";
        await customPacketGenerator(dataId, packet);
    }

    if (traceFlag[dataId] === true) {
        terminalMessage(
            hops + " " + 
            traceBuffer[dataId][traceBuffer[dataId].length - 2].toString().padEnd(15," ") + 
            traceBuffer[dataId][traceBuffer[dataId].length - 1].toString(), 
            dataId);
    } else {
        traceRouteFail(traceBuffer[dataId][traceBuffer[dataId].length - 1], hops, numeric);
    }

    trace[dataId] = false;

    function traceRouteFail(origin, seq, numeric = false) {
        if (document.querySelector(".terminal-component").style.display === "none") return;
        seq = numeric ? seq + 1 : "";
        terminalMessage(seq + " " + origin.toString().padEnd(15," ") + " *\n", dataId);
        window.pingInterval = setInterval(() => {
            seq = numeric ? seq + 1 : "";
            terminalMessage(seq + " " + `*               *\n`, dataId);
        }, 500);
    }

}

async function icmpRequestPacketGenerator(networkObjectId, originIp, destinationIp) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3"); 
    let packet = new IcmpEchoRequest(originIp, destinationIp, networkObjectMac, "");
    await hostRouting(networkObjectId, packet);
}

async function customPacketGenerator(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const destination_ip = packet.destination_ip;
    const isSameNetwork = getNetwork(networkObjectIp, $networkObject.getAttribute("netmask-enp0s3")) === getNetwork(destination_ip, $networkObject.getAttribute("netmask-enp0s3"));

    if (!isSameNetwork) {

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

    }


    const destination_mac = isIpInARPTable(networkObjectId, destination_ip);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, destination_ip);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}

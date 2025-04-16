async function http(networkObjectId, arg) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    delete browserBuffer[networkObjectId];
    let destinationIp = arg;
    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    //si es un dominio, intentamos resolverlo

    if (!isValidIp(destinationIp)) {
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) {
            if (visualToggle) await maximizeTerminal();
            throw new Error("Error: No se pudo resolver el dominio.");
        }
    }

    //http viaja por tcp, necesitamos establecer la conexión

    await tcp(networkObjectId, destinationIp, 80);
    if (tcpSyncFlag === false) {
        if (visualToggle) await maximizeTerminal();
        throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");
    }

    //hemos establecido la conexión, enviamos el paquete

    await httpRequestPacketGenerator(networkObjectId, switchId, destinationIp);
    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) {
        if (visualToggle) await maximizeTerminal();
        throw new Error("Error: No se ha recibido respuesta del servidor web.");
    }

    //si todo salió bien, mostramos el contenido

    if (visualToggle) await maximizeTerminal();
    terminalMessage("Conexión establecida con el servidor web.");
    let content = htmlReply.body;
    const $browserContent = document.querySelector(".browser-content");
    $browserContent.srcdoc = content;
}

async function httpRequestPacketGenerator(networkObjectId, switchId, destinationIp) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const isSameNetwork = getNetwork(destinationIp, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);
    let packet = new httpRequest(networkObjectIp, destinationIp, networkObjectMac, "", 80, "GET");

    if (!isSameNetwork) {
        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        packet.destination_mac = defaultGatewayMac;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;
    }

    const destination_mac = isIpInARPTable(networkObjectId, destinationIp);
    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
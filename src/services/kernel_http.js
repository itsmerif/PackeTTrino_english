async function http(networkObjectId, arg) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    delete browserBuffer[networkObjectId];
    let destinationIp = arg;

    if (!isValidIp(destinationIp)) {
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) throw new Error("Error: No se pudo resolver el dominio.");
    }

    await tcp(networkObjectId, destinationIp, 80);
    if (tcpSyncFlag === false) throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");

    await httpRequestPacketGenerator(networkObjectId, switchId, destinationIp);
    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) throw new Error("Error: No se ha recibido respuesta del servidor web.");

    terminalMessage("Conexión establecida con el servidor web.", networkObjectId);

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
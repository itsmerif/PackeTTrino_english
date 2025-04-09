async function tcp(networkObjectId, destination, port) {
    tcpSyncFlag = false;
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    await tcpSynPacketGenerator(networkObjectId, switchId, destination, port);
}

async function tcpSynPacketGenerator(networkObjectId, switchId, destination, port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const isSameNetwork = getNetwork(destination, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);
    let packet = new syn(networkObjectIp, destination, networkObjectMac, "", port);
    tcpBuffer[networkObjectId] = packet.sequence_number;

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

    const destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, destination);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
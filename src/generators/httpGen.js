async function httpRequestPacketGenerator(networkObjectId, switchId, destinationIp) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const isSameNetwork = getNetwork(destinationIp, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace
        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        let newPacket = new httpRequest(networkObjectIp, destinationIp, networkObjectMac, defaultGatewayMac, 80, "GET");
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    //están en la misma red

    const destination_mac = isIpInARPTable(networkObjectId, destinationIp);
    let newPacket = new httpRequest(networkObjectIp, destinationIp, networkObjectMac, destination_mac, 80, "GET");
    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);

}
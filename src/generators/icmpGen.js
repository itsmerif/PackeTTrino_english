async function icmpRequestPacketGenerator(networkObjectId, switchId, originIp, destinationIp) {

    const $networkObject = document.getElementById(networkObjectId);
    const isSameNetwork = getNetwork(originIp, $networkObject.getAttribute("data-netmask")) === getNetwork(destinationIp, $networkObject.getAttribute("data-netmask"));
    const networkObjectMac = $networkObject.getAttribute("data-mac"); 
    let packet = new IcmpEchoRequest(originIp, destinationIp, networkObjectMac, "");
    let destination_mac;

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

    destination_mac = isIpInARPTable(networkObjectId, destinationIp);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, destinationIp);
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
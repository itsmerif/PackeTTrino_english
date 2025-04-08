async function dhcrelay_service(agentObjectId, packet) {
    const $agentObject = document.getElementById(agentObjectId);
    const agentObjectMac = $agentObject.getAttribute("data-mac");
    const agentObjectIp = $agentObject.getAttribute("data-ip");
    const mainServer = $agentObject.getAttribute("data-main-server");
    const defaultGateway = $agentObject.getAttribute("data-gateway");
    const switchId = $agentObject.getAttribute("data-switch");
    const isDhcpRelayOn = $agentObject.getAttribute("dhcrelay") === "true";

    if (!isDhcpRelayOn) return;

    if (packet.destination_ip === agentObjectIp) {

        if (packet.type === "offer") {
            if (packet.giaddr !== agentObjectIp) return;
            packet.destination_mac = packet.ciaddr;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            await switchProcessor(switchId, agentObjectId, packet);
            return;
        }

        if (packet.type === "ack") {
            if (packet.giaddr === agentObjectMac) return;
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            await switchProcessor(switchId, agentObjectId, packet);
            return;
        }

    }

    if (packet.destination_ip = "255.255.255.255") {
        
        if (packet.type === "discover") {

            packet.chaddr = packet.origin_mac;
            packet.destination_ip = mainServer;
            packet.origin_mac = agentObjectMac;
            packet.giaddr = agentObjectIp;
            packet.destination_mac = "";
            packet.origin_ip = agentObjectIp;

            let defaultGatewayMac = isIpInARPTable(agentObjectId, defaultGateway);

            if (!defaultGatewayMac) {
                buffer[agentObjectId] = packet;
                await arpResolve(agentObjectId, defaultGateway);
                return;
            }

            packet.destination_mac = defaultGatewayMac;
            addPacketTraffic(packet);
            await switchProcessor(switchId, agentObjectId, packet);
            return;

        }

        if (packet.type === "request") {
            if (packet.giaddr !== agentObjectIp) return;
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = mainServer;
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = isIpInARPTable(agentObjectId, defaultGateway);
            addPacketTraffic(packet);
            await switchProcessor(switchId, agentObjectId, packet);
            return;
        }

    }

}
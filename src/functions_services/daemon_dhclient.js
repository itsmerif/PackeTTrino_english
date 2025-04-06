async function dhclient_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const switchId = $networkObject.getAttribute("data-switch");
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";

    if (!isDhclientOn) return;
    
    if (packet.type === "offer") {

        if (dhcpOfferBuffer[networkObjectId]) return;

        if ($networkObject.getAttribute("data-ip") !== "") return;

        if (packet.chaddr === networkObjectMac) {

            dhcpDiscoverFlag = true;

            dhcpOfferBuffer[networkObjectId] = true;

            let newPacket = new dhcpRequest(
                networkObjectMac, //origin mac
                packet.yiaddr, //requested ip
                packet.siaddr, //server ip
                networkObjectId //hostname
            );

            newPacket.destination_mac = packet.origin_mac;
            newPacket.yiaddr = packet.yiaddr;
            newPacket.giaddr = packet.giaddr;
            newPacket.chaddr = packet.chaddr;

            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);

        }

    }

    if (packet.type === "ack") {

        if (packet.chaddr === networkObjectMac) {
            dhcpRequestFlag = true;
            delete dhcpOfferBuffer[networkObjectId];
            setDhcpInfo(networkObjectId, packet);
        }

    }

}
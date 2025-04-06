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

            terminalMessage(`DHCPOFFER of ${packet.yiaddr} from ${packet.siaddr}`);

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

            terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on enp0s3 to ${packet.siaddr} port 67`);

            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);

        }

    }

    if (packet.type === "ack") {

        if (packet.chaddr === networkObjectMac) {
            terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`);
            dhcpRequestFlag = true;
            delete dhcpOfferBuffer[networkObjectId];
            setDhcpInfo(networkObjectId, packet);
            terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`); //TODO -> añadir el tiempo de renovación real
        }

    }

}
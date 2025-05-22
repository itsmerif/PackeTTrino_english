async function dhclient_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";

    if (!isDhclientOn) return;

    if (packet.type === "offer") {

        if (dhcpOfferBuffer[networkObjectId]) return;

        if ($networkObject.getAttribute("ip-enp0s3") !== "") return;

        if (packet.chaddr !== networkObjectMac) return;

        dhcpDiscoverFlag[networkObjectId] = true;

        terminalMessage(`DHCPOFFER of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);

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

        terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on enp0s3 to ${packet.siaddr} port 67`, networkObjectId);

        return newPacket;

    }

    if (packet.type === "ack") {
        if (packet.chaddr !== networkObjectMac) return;
        terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);
        dhcpRequestFlag[networkObjectId] = true;
        delete dhcpOfferBuffer[networkObjectId];
        setDhcpInfo(networkObjectId, packet);      
        updateClientLeaseTimer(networkObjectId);      
        terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`, networkObjectId);
    }

}

async function dhcpDiscoverGenerator(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet); // <--- pasa directamente a la red sin ser enrrutado ya que es un broadcast a nivel local
}

async function dhcpRequestGenerator(networkObjectId, renewPhase = "T1") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectGateway = $networkObject.getAttribute("data-gateway");
    const networkObjectDns = $networkObject.getAttribute("data-dns-server");
    const networkObjectLeaseTime = $networkObject.getAttribute("data-dhcp-lease-time");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");

    let packet = new dhcpRequest(
        networkObjectMac, //origin mac
        "", //requested ip
        dhcpServerIp, //server ip
        networkObjectId //hostname
    );

    packet.origin_ip = networkObjectIp;
    packet.destination_ip = dhcpServerIp;
    packet.ciaddr = networkObjectIp;
    packet.leasetime = networkObjectLeaseTime;
    packet.gateway = networkObjectGateway;
    packet.netmask = networkObjectNetmask;
    packet.dns = networkObjectDns;
    packet.destination_mac = ""; // <-- se inicializa vacía, a rellenar por el enrutamiento

    if (renewPhase === "T2") {
        packet.destination_ip = "255.255.255.255";
        packet.destination_mac = "ff:ff:ff:ff:ff:ff"; // <-- en el segundo intento se hacer por broadcast
    }

    await hostRouting(networkObjectId, packet);

}

async function dhcpReleaseGenerator(networkObjectId, networkObjectInterface = "enp0s3") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isDHCPOn = $networkObject.getAttribute("dhclient") === "true";
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");

    if (!isDHCPOn) return;

    let packet = new dhcpRelease(
        networkObjectIp, //ip de origen
        dhcpServerIp, //ip de destino
        networkObjectMac, //mac de origen
        "" //mac de destino
    );

    await hostRouting(networkObjectId, packet);

    deleteDhcpInfo(networkObjectId);

}

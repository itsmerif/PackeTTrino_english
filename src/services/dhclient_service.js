async function dhclient_service(networkObjectId, packet, networkObjectInterface = "enp0s3") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isDhclientOn = $networkObject.getAttribute("dhclient") === "true";

    if (!isDhclientOn) return;

    if (packet.type === "offer") {

        if (dhcpOfferBuffer[networkObjectId]) return;
        if ($networkObject.getAttribute(`ip-${networkObjectInterface}`) !== "") return;
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

        terminalMessage(`DHCPREQUEST for ${packet.yiaddr} on ${networkObjectInterface} to ${packet.siaddr} port 67`, networkObjectId);

        return newPacket;

    }

    if (packet.type === "ack") {

        if (packet.chaddr !== networkObjectMac) return;

        terminalMessage(`DHCPACK of ${packet.yiaddr} from ${packet.siaddr}`, networkObjectId);

        dhcpRequestFlag[networkObjectId] = true; //<-- se notifica a la utilidad de dhcp cliente que se ha recibido un DHCPACK

        delete dhcpOfferBuffer[networkObjectId]; //<-- se elimina el buffer de ofertas

        setDhcpInfo(networkObjectId, packet, networkObjectInterface); //<-- se configura la interfaz

        updateClientLeaseTimer(networkObjectId, networkObjectInterface); //<-- se inicia el timer de alquiler de cliente

        terminalMessage(`Bound to ${packet.yiaddr} -- renewal in ${packet.leasetime} seconds.`, networkObjectId);

    }

}

async function dhcpDiscoverGenerator(networkObjectId, networkObjectInterface) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const switchId = $networkObject.getAttribute(`data-switch-${networkObjectInterface}`);
    if (!switchId || !networkObjectMac) return;
    const packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
}

async function dhcpRequestGenerator(networkObjectId, renewPhase, networkObjectInterface) {

    //atributos de dispositivo
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);

    //atributos de cliente DHCP
    const networkObjectGateway = $networkObject.getAttribute("data-gateway");
    const networkObjectDns = getDnsServers(networkObjectId)[0];
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

async function dhcpReleaseGenerator(networkObjectId, networkObjectInterface) {

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

    deleteDhcpInfo(networkObjectId, networkObjectInterface);

}


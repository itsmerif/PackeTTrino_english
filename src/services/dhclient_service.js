/**ESTA FUNCION GESTIONA EL SERVICIO DHCP DESDE UN EQUIPO CLIENTE, DEVOLVIENDO UNA RESPUESTA SI ES NECESARIO */
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

/**ESTA FUNCION GENERA UN PAQUETE DHCP DISCOVER DESDE UN EQUIPO CLIENTE, Y LO ENVIA A LA RED */
async function dhcpDiscoverGenerator(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet); // <--- pasa directamente a la red sin ser enrrutado ya que es un broadcast a nivel local
}

/**ESTA FUNCION GENERA UN PAQUETE DHCP REQUEST (RENOVACION) DESDE UN EQUIPO CLIENTE, Y LO ENVIA A ENRRUTAR */
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

/**ESTA FUNCION GENERA UN PAQUETE DHCP RELEASE DESDE UN EQUIPO CLIENTE, Y LO ENVIA A ENRRUTAR */
async function dhcpReleaseGenerator(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const isDHCPon = $networkObject.getAttribute("dhclient");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");

    let packet = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, "");

    if (isDHCPon === "false" || !dhcpServerIp) {
        terminalMessage(networkObjectId + " : No se ha definido el servidor DHCP", networkObjectId);
        return;
    }

    await hostRouting(networkObjectId, packet);
    deleteDhcpInfo(networkObjectId);

}

/**ESTA FUNCION ACTUALIZA LA INFORMACION DE RED DE UNA INTERFAZ (POR DEFECTO ENP0S3) DE UN EQUIPO EN DHCP */
function setDhcpInfo(networkObjectId, packet, interface = "enp0s3") {

    const $networkObject = document.getElementById(networkObjectId);
    const newIp = packet.yiaddr;
    const newNetmask = packet.netmask;
    const newGateway = packet.gateway;
    const newServer = packet.siaddr;
    const newDns = packet.dns;
    const newLeaseTime = packet.leasetime;

    //configuramos la interfaz y la tabla de enrutamiento
    configureInterface(networkObjectId, newIp, newNetmask, interface);
    setDirectRoutingRule(networkObjectId, newIp, newNetmask, interface);
    $networkObject.setAttribute("data-gateway", newGateway);
    setRemoteRoutingRule(networkObjectId, "0.0.0.0", "0.0.0.0", newIp, interface, newGateway);

    //configuramos la informacion DHCP del equipo
    $networkObject.setAttribute("data-dhcp-server", newServer);
    $networkObject.setAttribute("data-dns-server", newDns);
    $networkObject.setAttribute("data-dhcp-lease-time", newLeaseTime);

}

/**ESTA FUNCION ELIMINA LA INFORMACION DE RED DE UNA INTERFAZ (POR DEFECTO ENP0S3) DE UN EQUIPO EN DHCP */
function deleteDhcpInfo(networkObjectId, interface = "enp0s3") {

    const $networkObject = document.getElementById(networkObjectId);

    //deconfiguramos la interfaz y eliminamos la entrada de la tabla de enrutamiento
    deconfigureInterface($networkObject.id, interface);
    $networkObject.setAttribute("data-gateway", "");
    removeDirectRoutingRule($networkObject.id, interface);
    removeRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0");

    //eliminamos la informacion DHCP del equipo
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("data-dhcp-current-lease-time", "");
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");
    clearInterval(clientLeaseTimers[networkObjectId]);
    delete clientLeaseTimers[networkObjectId];
}

/**ESTA FUNCION INICIA/REINICIA EL TIEMPO DE ALQUILER DHCP DE UN EQUIPO*/
async function updateClientLeaseTimer(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("data-dhcp-current-lease-time", 0);
    $networkObject.setAttribute("data-dhcp-flag-t1", "false");
    $networkObject.setAttribute("data-dhcp-flag-t2", "false");
    if (clientLeaseTimers[networkObjectId]) return;
    const clientLeaseTimer = setInterval( async () => { await reduceClientLeaseTime(networkObjectId)}, 1000 );
    clientLeaseTimers[networkObjectId] = clientLeaseTimer;
}

/**ESTA FUNCION REDUCE EL TIEMPO DE ALQUILER DHCP DE UN EQUIPO*/
async function reduceClientLeaseTime(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const leaseTime = parseInt($networkObject.getAttribute("data-dhcp-lease-time"));
    const flagT1 = $networkObject.getAttribute("data-dhcp-flag-t1");
    const flagT2 = $networkObject.getAttribute("data-dhcp-flag-t2");
    const T1 = leaseTime * 0.5;
    const T2 = leaseTime * 0.875;

    $networkObject.setAttribute("data-dhcp-current-lease-time", parseInt($networkObject.getAttribute("data-dhcp-current-lease-time")) + 1 );
    const currentLeaseTime = parseInt($networkObject.getAttribute("data-dhcp-current-lease-time"));
    
    if (currentLeaseTime > T1 && flagT1 === "false") {
        $networkObject.setAttribute("data-dhcp-flag-t1", "true");
        let renewAttempt = await dhcpRenewHandler(networkObjectId, switchId);
        if (renewAttempt) $networkObject.setAttribute("data-dhcp-flag-t1", "false");
        return;
    }

    if (currentLeaseTime > T2 && flagT2 === "false") {
        $networkObject.setAttribute("data-dhcp-flag-t2", "true");
        let renewAttempt = await dhcpRenewHandler(networkObjectId, switchId, "T2");
        if (renewAttempt) $networkObject.setAttribute("data-dhcp-flag-t2", "false");
        return;
    }

    if (currentLeaseTime >= leaseTime ) {
        clearInterval(clientLeaseTimers[networkObjectId]);
        delete clientLeaseTimers[networkObjectId];
        deleteDhcpInfo(networkObjectId);
        await dhcpDiscoverGenerator(networkObjectId, switchId);
        return;
    }

}
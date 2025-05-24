async function dhcpd_service(serverObjectId, packet, interface) {
    
    //atributos del servidor
    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute(`mac-${interface}`);
    const serverObjectIp = $serverObject.getAttribute(`ip-${interface}`);
    const serverObjectNetmask = $serverObject.getAttribute(`netmask-${interface}`);
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);

    //atributos del servicio DHCP
    const defaultGateway = $serverObject.getAttribute("data-gateway");
    const rangeStart = $serverObject.getAttribute("data-range-start");
    const rangeEnd = $serverObject.getAttribute("data-range-end");
    const netmaskOffer = $serverObject.getAttribute("dhcp-offer-netmask");
    const networkOffer = getNetwork(rangeStart, netmaskOffer);
    const leaseTime = $serverObject.getAttribute("dhcp-offer-lease-time");
    const gatewayOffer = $serverObject.getAttribute("dhcp-offer-gateway") || "";
    const dnsOffer = $serverObject.getAttribute("dhcp-offer-dns") || "";
    const isDhcpServerOn = $serverObject.getAttribute("dhcpd") === "true";
    const listenOnInterfaces = $serverObject.getAttribute("dhcp-listen-on-interfaces").split(",");

    if (!isDhcpServerOn) return; //<-- si el DHCP Server no esta activado, no se procesa nada

    if (!listenOnInterfaces.includes(interface)) return; //<-- si el DHCP Server no esta configurado para el interfaz, no se procesa nada

    if (packet.type === "discover") { //descubrimiento por un cliente

        if (!rangeStart || !rangeEnd || !netmaskOffer || !leaseTime) return;
        
        let offerIP = getReservedIp(serverObjectId, packet.chaddr) || getRandomIPfromDhcp(serverObjectId);
        
        let newPacket = new dhcpOffer(
            serverObjectIp, //ip de origen
            serverObjectMac, //mac de origen
            serverObjectIp, //siaddr
            offerIP, //yiaddr
            packet.origin_mac, //mac de destino
            packet.chaddr, //chaddr
            gatewayOffer, //oferta gateway
            netmaskOffer, //oferta mascara
            dnsOffer, //oferta dns
            leaseTime //oferta tiempo de alquiler
        );

        if (packet.giaddr === "0.0.0.0") {
            if (networkOffer !== serverObjectNetwork ) return; //<-- comprobamos si se sirve a ese segmento de red
        } else {
            if (networkOffer !== getNetwork(packet.giaddr, netmaskOffer)) return; //<-- comprobamos si se sirve a ese segmento de red
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
        }

        return newPacket;

    }

    if (packet.type === "request" && packet.ciaddr === "0.0.0.0") { //solicitud por un cliente sin ip asignada

        if (packet.siaddr !== serverObjectIp) return; //<--comprobamos si va dirigido al servidor

        let newPacket = new dhcpAck(
            serverObjectMac, //mac de origen
            packet.yiaddr, //yiaddr
            serverObjectIp, //siaddr
            gatewayOffer, //oferta gateway
            netmaskOffer, //oferta mascara
            dnsOffer, //oferta dns
            packet.hostname, //hostname
            leaseTime //oferta tiempo de alquiler
        );

        newPacket.chaddr = packet.chaddr;
        newPacket.destination_mac = packet.origin_mac;

        if (packet.giaddr !== "0.0.0.0") {
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
        }

        addDhcpEntry(serverObjectId, packet.yiaddr, packet.chaddr, packet.hostname);
        return newPacket;

    }

    if (packet.type === "request" && packet.ciaddr !== "0.0.0.0") { //renovación de una ip asignada

        if (packet.siaddr !== serverObjectIp) return;

        if (!updateDhcpEntry(serverObjectId, packet)) return;

        let newPacket = new dhcpAck(
            serverObjectMac, //origin mac
            packet.ciaddr, //ip asignada
            serverObjectIp, //ip del servidor
            packet.gateway, // oferta gateway
            packet.netmask, //oferta mascara
            packet.dns, //oferta dns
            packet.hostname, //hostname
            leaseTime //oferta tiempo de alquiler
        );

        newPacket.destination_ip = packet.origin_ip;
        newPacket.destination_mac = packet.origin_mac;
        newPacket.chaddr = packet.chaddr;

        return newPacket;

    }

    if (packet.type === "release") { //liberación de una ip asignada
        if (packet.siaddr !== serverObjectIp) return;
        deleteDhcpEntry(serverObjectId, packet.ciaddr);
        return;
    }
    
}

function updateServerLeaseTimes(serverObjectId) {

    const $serverObject = document.getElementById(serverObjectId);
    const $leasesTable = $serverObject.querySelector(".dhcp-table").querySelector("table");
    const $leaseTimes = $leasesTable.querySelectorAll(".lease-time");

    $leaseTimes.forEach(leaseTime => {

        let time = parseInt(leaseTime.innerHTML, 10);

        if (time > 0) leaseTime.innerHTML = time - 1;

        if (time === 0) {
            let row = leaseTime.parentNode;
            row.remove();
        }

    });

    if ($leasesTable.querySelectorAll("tr").length === 1) {
        clearInterval(serverLeaseTimers[serverObjectId]);
        delete serverLeaseTimers[serverObjectId];
    }

}
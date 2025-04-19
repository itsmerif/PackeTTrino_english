async function dhcpd_service(serverObjectId, packet) {
    
    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("mac-enp0s3");
    const serverObjectIp = $serverObject.getAttribute("ip-enp0s3");
    const serverObjectNetmask = $serverObject.getAttribute("netmask-enp0s3");
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);

    const defaultGateway = $serverObject.getAttribute("data-gateway");
    const rangeStart = $serverObject.getAttribute("data-range-start");
    const rangeEnd = $serverObject.getAttribute("data-range-end");
    const netmaskOffer = $serverObject.getAttribute("offer-netmask");
    const leaseTime = $serverObject.getAttribute("offer-lease-time");
    const gatewayOffer = $serverObject.getAttribute("offer-gateway") || "";
    const dnsOffer = $serverObject.getAttribute("offer-dns") || "";
    const isDhcpServerOn = $serverObject.getAttribute("dhcpd") === "true";

    if (!isDhcpServerOn) return;

    if (packet.type === "discover") { //descubrimiento por un cliente

        if (!rangeStart || !rangeEnd || !netmaskOffer || !leaseTime) return;
        
        let offerIP = getReservedIp(serverObjectId, packet.chaddr) || getRandomIPfromDhcp(serverObjectId);
        
        let newPacket = new dhcpOffer(
            serverObjectIp,
            serverObjectMac,
            serverObjectIp,
            offerIP,
            packet.origin_mac,
            packet.chaddr,
            gatewayOffer,
            netmaskOffer,
            dnsOffer,
            leaseTime
        );


        if (packet.giaddr !== "0.0.0.0") { //servir a redes remotas

            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;

        } else { //servir a redes locales

            if ( getNetwork(rangeStart, netmaskOffer) !== serverObjectNetwork ) return;

        }

        return newPacket;

    }

    if (packet.type === "request" && packet.ciaddr === "0.0.0.0") { //solicitud por un cliente sin ip asignada

        if (packet.siaddr !== serverObjectIp) return;

        let newPacket = new dhcpAck(
            serverObjectMac,
            packet.yiaddr,
            serverObjectIp,
            gatewayOffer,
            netmaskOffer,
            dnsOffer,
            packet.hostname,
            leaseTime
        );

        newPacket.chaddr = packet.chaddr;
        newPacket.destination_mac = packet.origin_mac;

        if (packet.giaddr !== "0.0.0.0") {
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
            newPacket.destination_mac = isIpInARPTable(serverObjectId, defaultGateway); //no basta con esto!!!!
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
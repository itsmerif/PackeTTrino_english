let buffer = {};

function command_Pack(dataId, args) {
    const origin_ip = document.getElementById(dataId).getAttribute("data-ip");
    const destination_ip = args[1];
    const type = args[2];
    packetGenerator(dataId, origin_ip, destination_ip, type);
}

function packetGenerator(originId, originIP, destinationIP, type) {

    const networkObject = document.getElementById(originId);
    const networkObjectNetmask = networkObject.getAttribute("data-netmask");
    const switchObjectId = networkObject.getAttribute("data-switch");
    const originMac = networkObject.getAttribute("data-mac");
    let packet;
    let destinationMac;

    if (!switchObjectId) {
        terminalMessage("Error: Este equipo no tiene conexión.");
        return;
    }

    if (getNetwork(originIP, networkObjectNetmask) !== getNetwork(destinationIP, networkObjectNetmask)) {
        return;
    }

    destinationMac = isIpInARPTable(originId, destinationIP);

    if (!destinationMac) {
        buffer[originId] = { originId, originIP, destinationIP, type };
        packet = arpRequest(originIP, destinationIP, originMac);
        terminalMessage(originId + ": Enviando ARP Request...");
        kernelSwitch(originId, switchObjectId, packet);
        return;
    }

    switch (type) {
        case "icmp-echo-request":
            packet = icmpEchoRequest(originIP, destinationIP, originMac, destinationMac);
            break;
        case "icmp-echo-reply":
            packet = icmpEchoReply(originIP, destinationIP, originMac, destinationMac);
            break;
        case "arp-reply":
            packet = arpReply(originIP, destinationIP, originMac, destinationMac);
            break;
    }

    if (packet) {
        terminalMessage(originId + ": Enviando paquete " + type + "...");
        kernelSwitch(originId, switchObjectId, packet);
    }
}

function kernelSwitch(networkObjectId, switchObjectId, packet) {

    saveMac(switchObjectId, networkObjectId, packet.layer2.origin_mac);

    if (packet.layer2.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchObjectId, packet.layer2.destination_mac)) {
        const physical_ports = getDeviceTable(switchObjectId);

        for (let i = 0; i < physical_ports.length; i++) {

            if (physical_ports[i] !== networkObjectId) {

                if (physical_ports[i].startsWith("router-")) {
                    packetProcessor_Router(switchObjectId, physical_ports[i], packet);
                }

                packetProcessor(physical_ports[i], packet);

            }
        }

        return;
    }

    const device = getDeviceFromMac(switchObjectId, packet.layer2.destination_mac);
    terminalMessage(switchObjectId + ": Enviando paquete directamente a " + device);

    if (device.startsWith("router-")) {
        packetProcessor_Router(switchObjectId, device, packet);
    } else {
        packetProcessor(device, packet);
    }

}

function packetProcessor(networkObjectId, packet) {

    console.log(networkObjectId, packet);
    const networkObject = document.getElementById(networkObjectId);
    const switchObjectId = networkObject.getAttribute("data-switch");

    if (packet.layer2.protocol === "arp") {

        if (packet.layer2.type === "request") {

            if (packet.layer3.destination_ip !== networkObject.getAttribute("data-ip")) {
                //terminalMessage(networkObjectId + ": Error: La IP de destino no coincide con la IP del equipo destino: " + networkObject.getAttribute("data-ip"));
                return;
            }

            addARPEntry(networkObjectId, packet.layer3.origin_ip, packet.layer2.origin_mac);
            packetGenerator(networkObjectId, packet.layer3.destination_ip, packet.layer3.origin_ip, "arp-reply");

        } else if (packet.layer2.type === "reply") {

            addARPEntry(networkObjectId, packet.layer3.origin_ip, packet.layer2.origin_mac);
            terminalMessage(networkObjectId + ": La IP de " + networkObjectId + " ha sido agregada a la tabla ARP.");

            //comprobamos si hay paquetes pendientes

            if (buffer[networkObjectId]) {
                packetGenerator(networkObjectId, buffer[networkObjectId].originIP, buffer[networkObjectId].destinationIP, buffer[networkObjectId].type);
                delete buffer[networkObjectId];
            }

            return;

        }

    }

    if (packet.layer3.protocol === "icmp") {

        if (packet.layer3.type === "echo-request") {

            if (packet.layer3.destination_ip !== networkObject.getAttribute("data-ip")) {
                //terminalMessage("Error: La IP de destino no coincide con la IP del equipo destino: " + networkObject.getAttribute("data-ip"));
                return;
            }

            addARPEntry(networkObjectId, packet.layer3.origin_ip, packet.layer2.origin_mac);
            const newPacket = icmpEchoReply(networkObject.getAttribute("data-ip"), packet.layer3.origin_ip, networkObject.getAttribute("data-mac"), packet.layer2.origin_mac);
            terminalMessage("Respondiendo ICMP...");
            kernelSwitch(networkObjectId, switchObjectId, newPacket);

        } else if (packet.layer3.type === "echo-reply") {

            terminalMessage("Respuesta ICMP recibida.");

        }

    }
}

function packetProcessor_Router(switchObjectId, routerObjectId, packet) {

    const routerObject = document.getElementById(routerObjectId);
    let routerObjectIp;

    if (routerObject.getAttribute("data-switch-enp0s3") === switchObjectId) {
        routerObjectIp = routerObject.getAttribute("ip-enp0s3");
    } else if (routerObject.getAttribute("data-switch-enp0s8") === switchObjectId) {
        routerObjectIp = routerObject.getAttribute("ip-enp0s8");
    } else if (routerObject.getAttribute("data-switch-enp0s9") === switchObjectId) {
        routerObjectIp = routerObject.getAttribute("ip-enp0s9");
    }

    if (routerObjectIp === packet.layer3.destination_ip) { //el destino es el router

        if (packet.layer2.protocol === "arp" && packet.layer2.type === "request") {
            addARPEntry(routerObjectId, packet.layer3.origin_ip, packet.layer2.origin_mac);
            const newPacket = arpReply(routerObjectIp, packet.layer3.origin_ip, routerObject.getAttribute("data-mac"), packet.layer2.origin_mac);
            terminalMessage(routerObjectIp + " respondiendo ARP...");
            kernelSwitch(routerObjectId, switchObjectId, newPacket);
            return;
        }

        if (packet.layer3.protocol === "icmp" && packet.layer3.type === "echo-request") {
            const newPacket = icmpEchoReply(routerObjectIp, packet.layer3.origin_ip, routerObject.getAttribute("data-mac"), packet.layer2.origin_mac);
            terminalMessage(routerObjectIp + " respondiendo ICMP...");
            kernelSwitch(routerObjectId, switchObjectId, newPacket);
            return;
        }

    }

    //el dispositivo debe enrutar el paquete

    const destination_ip = packet.layer3.destination_ip;
    const routingTable = routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    //reglas de conexion directa

    for (let i = 1; i <= 3; i++) {

        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let ruleNetwork = cells[0].innerHTML;
        let ruleNetmask = cells[1].innerHTML;
        let ruleInterface = cells[3].innerHTML;

        if (ruleNetwork === getNetwork(destination_ip, ruleNetmask)) {
            const physical_port = routerObject.getAttribute("data-switch-" + ruleInterface);
            packet.layer2.destination_mac = "ff:ff:ff:ff:ff:ff";
            console.log(packet);
            terminalMessage(routerObjectId + " enviando paquete a " + physical_port);
            kernelSwitch(routerObjectId, physical_port, packet);
        }

    }

}
function command_Pack(dataId, args) {
    const origin_ip = document.getElementById(dataId).getAttribute("data-ip");
    const destination_ip = args[1];
    packetGenerator(dataId, origin_ip, destination_ip);
}

function packetGenerator(originId, originIP, destinationIP) {
    const networkObject = document.getElementById(originId);
    const switchObjectId = networkObject.getAttribute("data-switch");
    const originMac = networkObject.getAttribute("data-mac");
    const destinationMac = isIpInARPTable(originId, destinationIP);

    if (!switchObjectId) {
        terminalMessage("Error: Este equipo no tiene conexión.");
        return;
    }

    if (!destinationMac) {
        const arpRequest = {
            layer3: {
                origin_ip: originIP,
                destination_ip: destinationIP,
            },
            layer2: {
                origin_mac: originMac,
                destination_mac: "ff:ff:ff:ff:ff:ff",
                protocol: "arp",
                type: "request"
            }
        };

        terminalMessage("La IP de destino no está en la tabla ARP del origen. Enviando solicitud ARP...");
        kernelSwitch(originId, switchObjectId, arpRequest);
        return;
    }

    const packet = {
        layer3: {
            origin_ip: originIP,
            destination_ip: destinationIP,
            protocol: "icmp",
            ttl: 64,
            type: "echo-request",
            code: 0
        },
        layer2: {
            origin_mac: originMac,
            destination_mac: destinationMac
        }
    };

    terminalMessage("Enviando paquete ICMP...");
    kernelSwitch(originId, switchObjectId, packet);
}

function kernelSwitch(networkObjectId, switchObjectId, packet) {

    saveMac(switchObjectId, networkObjectId, packet.layer2.origin_mac);

    if (packet.layer2.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchObjectId, packet.layer2.destination_mac)) {
        const physical_ports = getDeviceTable(switchObjectId);

        for (let i = 0; i < physical_ports.length; i++) {
            if (physical_ports[i] !== networkObjectId) {
                packetProcessor(physical_ports[i], packet);
            }
        }
        return;
    }

    const device = getDeviceFromMac(switchObjectId, packet.layer2.destination_mac);
    terminalMessage("Enviando paquete directamente a " + device);
    packetProcessor(device, packet);
}

function packetProcessor(networkObjectId, packet) {
    const networkObject = document.getElementById(networkObjectId);
    const switchObjectId = networkObject.getAttribute("data-switch");

    if (packet.layer2.protocol === "arp" && packet.layer2.type === "request") {

        if (packet.layer3.destination_ip !== networkObject.getAttribute("data-ip")) {
            terminalMessage("Error: La IP de destino no coincide con la IP del equipo destino: " + networkObject.getAttribute("data-ip"));
            return;
        }

        const newPacket = {
            layer3: {
                origin_ip: networkObject.getAttribute("data-ip"),
                destination_ip: packet.layer3.origin_ip
            },
            layer2: {
                origin_mac: networkObject.getAttribute("data-mac"),
                destination_mac: packet.layer2.origin_mac,
                protocol: "arp",
                type: "reply"
            }
        };

        terminalMessage(networkObject.getAttribute("data-ip") + " respondiendo ARP...");
        kernelSwitch(networkObjectId, switchObjectId, newPacket);
        return;
    }

    if (packet.layer2.protocol === "arp" && packet.layer2.type === "reply") {
        addARPEntry(networkObjectId, packet.layer3.origin_ip, packet.layer2.origin_mac);
        terminalMessage("La IP de " + networkObjectId + " ha sido agregada a la tabla ARP.");
        return;
    }

    if (packet.layer2.protocol === "icmp" && packet.layer2.type === "echo-request") {

        if (packet.layer3.destination_ip !== networkObject.getAttribute("data-ip")) {
            terminalMessage("Error: La IP de destino no coincide con la IP del equipo destino: " + networkObject.getAttribute("data-ip"));
            return;
        }

        if (packet.layer2.destination_mac !== networkObject.getAttribute("data-mac")) {
            terminalMessage("Error: La MAC de destino no coincide con la MAC del equipo destino: " + networkObject.getAttribute("data-mac"));
            return;
        }

        const newPacket = {
            layer3: {
                origin_ip: networkObject.getAttribute("data-ip"),
                destination_ip: packet.layer3.origin_ip,
                protocol: "icmp",
                ttl: packet.layer3.ttl - 1,
                type: "echo-reply",
                code: 0
            },
            layer2: {
                origin_mac: networkObject.getAttribute("data-mac"),
                destination_mac: packet.layer2.origin_mac
            }
        };

        terminalMessage("Respondiendo ICMP...");
        kernelSwitch(networkObjectId, switchObjectId, newPacket);
        return;
    }

    if (packet.layer2.protocol === "icmp" && packet.layer2.type === "echo-reply") {
        terminalMessage("Respuesta ICMP recibida.");
        return;
    }
}
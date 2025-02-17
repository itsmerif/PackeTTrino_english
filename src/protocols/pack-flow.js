buffer = {};

class ArpRequest {
    constructor(origin_ip, destination_ip, origin_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = "ff:ff:ff:ff:ff:ff";
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "request";
    }
}

class ArpReply {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "reply";
    }
}

function sp(id, args) {

    let ip; let netmask; let switchId; let destination; let packet; let type;
    const $networkObject = document.getElementById(id);

    if (args.length > 4 || args.length < 3) {
        terminalMessage("Error: Sintaxis: sp [source (only for routers)] <destination> <packet-type>");
        return;
    }

    if (args.length === 3) {
        destination = args[1];
        type = args[2];
        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }
    }

    if (args.length === 4) {
        destination = args[2];
        type = args[3];
        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }
    }

    if (!id.startsWith("router-")) { //solo tiene 1 interfaz de red

        if (args.length === 4) {
            terminalMessage("Error: Origen Personalizable no admitido. Sintaxis: sp [source (only for routers)] <destination> <packet-type>");
            return;
        }

        ip = $networkObject.getAttribute("data-ip");
        netmask = $networkObject.getAttribute("data-netmask");
        switchId = $networkObject.getAttribute("data-switch");

    }

    if (id.startsWith("router-")) { //tiene 3 interfaces de red

        if (args.length === 4) { //tenemos el argumento con la ip de origen
            //comprobamos que sea una ip de alguna interfaz de red
            switch (args[1]) {
                case $networkObject.getAttribute("ip-enp0s3"):
                    ip = $networkObject.getAttribute("ip-enp0s3");
                    netmask = $networkObject.getAttribute("netmask-enp0s3");
                    switchId = $networkObject.getAttribute("data-switch-enp0s3");
                    break;
                case $networkObject.getAttribute("ip-enp0s8"):
                    ip = $networkObject.getAttribute("ip-enp0s8");
                    netmask = $networkObject.getAttribute("netmask-enp0s8");
                    switchId = $networkObject.getAttribute("data-switch-enp0s8");
                    break;
                case $networkObject.getAttribute("ip-enp0s9"):
                    ip = $networkObject.getAttribute("ip-enp0s9");
                    netmask = $networkObject.getAttribute("netmask-enp0s9");
                    switchId = $networkObject.getAttribute("data-switch-enp0s9");
                    break;
                default:
                    terminalMessage("Error: La IP de origen introducida no es válida.");
                    return;
            }
        } else {
            ip = $networkObject.getAttribute("ip-enp0s3");
            netmask = $networkObject.getAttribute("netmask-enp0s3");
            switchId = $networkObject.getAttribute("data-switch-enp0s3");
        }
    }

    if (!ip || !netmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    switch (type) {
        case "arp-request":
            packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
            break;
        case "arp-reply":
            packet = new ArpReply(ip, destination, $networkObject.getAttribute("data-mac"));
            break;
        default:
            terminalMessage("Error: Tipo de paquete no reconocido.");
            break;
    }

    terminalMessage("Generando paquete...");

    if (!switchId) {
        terminalMessage("Error: No se ha detectado ninguna conexión.");
        return;
    }

    if (packet) {
        packetSender(id, packet);
    }

}

function packetSender(networkObjectId, packet) { //esta funcion se encarga de evaluar el camino que debe seguir el paquete

    const $networkObject = document.getElementById(networkObjectId);

    if ( packet.protocol !== "arp" && !isIpInARPTable($networkObject.id, packet.destination_ip)) { //el destino del paquete no está en la tabla de ARP
        buffer[networkObjectId] = packet;
        terminalMessage(networkObjectId + ": no existe en la tabla de ARP, se guarda en el buffer.");
        let arpRequest = new ArpRequest(packet.origin_ip, packet.destination_ip, $networkObject.getAttribute("data-mac"));
        switchProcessor($networkObject.getAttribute("data-switch"), networkObjectId, arpRequest);
        return;
    }
    
}

function switchProcessor(switchId, physical_port, packet) {

    const $switchObject = document.getElementById(switchId);
    saveMac($switchObject.id, physical_port, packet.origin_mac);

    if (packet.destination_ip === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable($switchObject.id, packet.destination_mac)) {
        terminalMessage(switchId + ": Saturación de puertos...");
        let ports = getDeviceTable($switchObject.id);
        for (let i = 0; i < ports.length; i++) {
            let port = ports[i];
            if (port !== physical_port) { //no saturamos el puerto de origen
                packetProcessor(switchId, port, packet);
            }
        }

        return;
    }

    let port = getDeviceFromMac($switchObject.id, packet.destination_mac);
    terminalMessage(switchId + ": Reenviando paquete a " + port);
    packetProcessor(switchId, port, packet);

}

function packetProcessor(switchId, port, packet) {

    const $networkObject = document.getElementById(port);
    const networkObjectMac = $networkObject.getAttribute("data-mac");

    let networkObjectIp;

    if (!$networkObject.id.startsWith("router-")) {
        networkObjectIp = $networkObject.getAttribute("data-ip");
    }

    if ($networkObject.id.startsWith("router-")) { //tomo la ip de la interfaz conectada al switch

        switch (switchId) {
            case $networkObject.getAttribute("data-switch-enp0s3"):
                networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
                break;
            case $networkObject.getAttribute("data-switch-enp0s8"):
                networkObjectIp = $networkObject.getAttribute("ip-enp0s8");
                break;
            case $networkObject.getAttribute("data-switch-enp0s9"):
                networkObjectIp = $networkObject.getAttribute("ip-enp0s9");
                break;
        }

        if (packet.destination_ip !== networkObjectIp) { //no es el destino, entonces lo debe redireccionar
            //packetRouting(switchId, port, packet);
            return;
        }

    }

    if (packet.protocol === "arp" && packet.type === "request") {

        terminalMessage(port + ": Solicitud ARP recibida");

        if (packet.destination_ip !== networkObjectIp) {
            terminalMessage(port + ": Solicitud ARP invalida");
            return;
        }

        terminalMessage(port + ": Enviando un ARP REPLY");
        addARPEntry(port, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        switchProcessor(switchId, port, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        terminalMessage(port + ": Respuesta ARP recibida");

        if (packet.destination_ip !== networkObjectIp) {
            terminalMessage(port + ": Respuesta ARP invalida");
            return;
        }

        addARPEntry(port, packet.origin_ip, packet.origin_mac);
        terminalMessage("El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");
        return;

    }

}


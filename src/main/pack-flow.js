//variables de animaciones
let visualToggle = false;
let visualSpeed = 1000;
//variables generales de hosts
let buffer = {}; //buffer general de paquetes para cada objeto de red
let browserBuffer = {}; //buffer de paquetes http
//variables de arp
let arpFlag = false;
let icmpFlag = false;
//variables de dhcp
let dhcpDiscoverFlag = false;
let dhcpRequestFlag = false;
let dhcpRenewFlag = false;
let dnsRequestFlag = false;
//variables de tcp
let tcpBuffer = {}; //buffer de numeros de secuencia TCP
let tcpSyncFlag = false;
let order = 0;
//variables de traceroute
let trace =  false; //se activa el modo traceroute
let traceReturn = false; //retorno del icmp con time exceeded
let traceBuffer = []; //buffer de saltos
let traceFlag = false; //bandera de traceroute

//Generadores

async function icmpRequestPacketGenerator(networkObjectId, switchId, ip, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const isSameNetwork = getNetwork(ip, $networkObject.getAttribute("data-netmask")) === getNetwork(destination, $networkObject.getAttribute("data-netmask"));
    let destination_mac; let packet;

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace

        //terminalMessage(networkObjectId + ": Destino En Otra Red...");
        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            //terminalMessage(networkObjectId + ": Error: Puerta de Enlace Predetermina No Configurada");
            throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            //terminalMessage(networkObjectId + ": Gateway No Guardado. Enviando ARP por " + defaultGateway);
            buffer[networkObjectId] = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), "");
            packet = new ArpRequest(ip, defaultGateway, $networkObject.getAttribute("data-mac"));
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        packet = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), defaultGatewayMac);
        icmpFlag = false;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        //guardamos el paquete en el buffer y enviamos una solicitud ARP primero
        buffer[networkObjectId] = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), "");
        packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), destination_mac);
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}

async function icmpReplyPacketGenerator(networkObjectId, switchId, ip, destination) {

    const $networkObject = document.getElementById(networkObjectId);
    const isSameNetwork = getNetwork(ip, $networkObject.getAttribute("data-netmask")) === getNetwork(destination, $networkObject.getAttribute("data-netmask"));
    let destination_mac; let packet;

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace

        //terminalMessage(networkObjectId + ": Destino En Otra Red...");
        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            //terminalMessage(networkObjectId + ": Error: Puerta de Enlace Predetermina No Configurada");
            throw new Error("Error: Puerta de Enlace Predetermina No Configurada");
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            //terminalMessage(networkObjectId + ": Gateway No Guardado. Enviando ARP por " + defaultGateway);
            buffer[networkObjectId] = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), "");
            packet = new ArpRequest(ip, defaultGateway, $networkObject.getAttribute("data-mac"));
            arpFlag = false;
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        packet = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), defaultGatewayMac);
        icmpFlag = false;

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), "");
        packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
        arpFlag = false;

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), destination_mac);
        icmpFlag = false;

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}

async function dhcpDiscoverGenerator(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let packet = new dhcpDiscover(networkObjectMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    return;
}

async function dhcpReleaseGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const neworkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const isDHCPon = $networkObject.getAttribute("data-dhcp");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    let newPacket;

    if (isDHCPon === "false" || !dhcpServerIp) {
        terminalMessage(networkObjectId + " : No se ha definido el servidor DHCP");
        return;
    }

    //enviamos el dhcp release

    if (getNetwork(networkObjectIp, neworkObjectNetmask) !== getNetwork(dhcpServerIp, neworkObjectNetmask)) { //estan en diferentes redes

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        newPacket = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, defaultGatewayMac); //creamos el paquete dirigido a la puerta de enlace

        if (!defaultGatewayMac) { //no tenemos la puerta de enlace en la la tabla ARP
            buffer[networkObjectId] = newPacket;
            let arpRequest = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(arpRequest);
            await switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla ARP

        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        deleteDhcpInfo(networkObjectId);
        return;

    }

    //están en la misma red

    const serverObjectMac = isIpInARPTable(networkObjectId, dhcpServerIp);
    newPacket = new dhcpRelease(networkObjectIp, dhcpServerIp, networkObjectMac, serverObjectMac);

    if (!serverObjectMac) { //la mac del server no está en la tabla arp
        buffer[networkObjectId] = newPacket;
        let arpRequest = new ArpRequest(networkObjectIp, dhcpServerIp, networkObjectMac);
        addPacketTraffic(arpRequest);
        await switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    //la mac del server está en la tabla arp

    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);
    deleteDhcpInfo(networkObjectId);

}

async function dhcpRenewGenerator(networkObjectId, switchId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const dhcpServerIp = $networkObject.getAttribute("data-dhcp-server");
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dhcpServerIp, networkObjectNetmask);
    let newPacket;

    if (!isSameNetwork) { //el servidor dhcp no está en la misma red, intentamos llevarlo a la puerta de enlace

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        newPacket = new dhcpRenew(networkObjectIp, dhcpServerIp, networkObjectMac, defaultGatewayMac, networkObjectId);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            buffer[networkObjectId] = newPacket;
            let arpRequest = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(arpRequest);
            await switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;

    }

    //el servidor dhcp está en la misma red, enviamos un DHCP Renew

    const destination_mac = isIpInARPTable(networkObjectId, dhcpServerIp);
    newPacket = new dhcpRenew(networkObjectIp, dhcpServerIp, networkObjectMac, destination_mac, networkObjectId);

    if (!destination_mac) { //la mac del servidor no está en la tabla arp
        buffer[networkObjectId] = newPacket;
        let arpRequest = new ArpRequest(networkObjectIp, dhcpServerIp, networkObjectMac);
        addPacketTraffic(arpRequest);
        await switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    //la mac del servidor está en la tabla arp

    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);

}

async function dnsRequestPacketGenerator(networkObjectId, switchId, domain) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const dnsServer = $networkObject.getAttribute("data-dns-server");
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dnsServer, networkObjectNetmask);
    let packet;

    if (!dnsServer) {
        terminalMessage(networkObjectId + ": No se ha definido el servidor DNS");
        return;
    }

    if (!isSameNetwork) { //el servidor dns no está en la misma red, intentamos llevarlo a la puerta de enlace

        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, defaultGatewayMac, domain);

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            buffer[networkObjectId] = packet;
            let arpRequest = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(arpRequest);
            await switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp

        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    const destination_mac = isIpInARPTable(networkObjectId, dnsServer);
    packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, destination_mac, domain);

    if (!destination_mac) { //la mac del servidor no está en la tabla arp
        buffer[networkObjectId] = packet;
        let arpRequest = new ArpRequest(networkObjectIp, dnsServer, networkObjectMac);
        addPacketTraffic(arpRequest);
        await switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}

async function tcpSynPacketGenerator(networkObjectId, switchId, destination, port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const isSameNetwork = getNetwork(destination, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);
    let packet;

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            terminalMessage(networkObjectId + ": Error: Puerta de Enlace Predetermina No Configurada");
            return;
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = new syn(networkObjectIp, destination, networkObjectMac, defaultGatewayMac, port);
            tcpBuffer[networkObjectId] = buffer[networkObjectId].sequence_number; //almacenamos el número de secuencia para el siguiente paquete
            packet = new ArpRequest(networkObjectIp, defaultGateway, networkObjectMac);
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp

        packet = new syn(networkObjectIp, destination, networkObjectMac, defaultGatewayMac, port);
        tcpBuffer[networkObjectId] = packet.sequence_number; //almacenamos el número de secuencia para el siguiente paquete
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = new syn(networkObjectIp, destination, networkObjectMac, destination_mac, port);
        tcpBuffer[networkObjectId] = buffer[networkObjectId].sequence_number; //almacenamos el número de secuencia para el siguiente paquete
        packet = new ArpRequest(networkObjectIp, destination, networkObjectMac);
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new syn(networkObjectIp, destination, networkObjectMac, destination_mac, port);
        tcpBuffer[networkObjectId] = packet.sequence_number; //almacenamos el número de secuencia para el siguiente paquete
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}

async function httpRequestPacketGenerator(networkObjectId, switchId, destinationIp) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const isSameNetwork = getNetwork(destinationIp, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);

    if (!isSameNetwork) { //el destino no está en la misma red, debemos enviarlo a la puerta de enlace
        const defaultGateway = $networkObject.getAttribute("data-gateway");
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);
        let newPacket = new httpRequest(networkObjectIp, destinationIp, networkObjectMac, defaultGatewayMac, 80, "GET");
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    //están en la misma red

    const destination_mac = isIpInARPTable(networkObjectId, destinationIp);
    let newPacket = new httpRequest(networkObjectIp, destinationIp, networkObjectMac, destination_mac, 80, "GET");
    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);

}

//generadores especiales

async function customPacketGenerator(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const switchId = $networkObject.getAttribute("data-switch");
    const destination_ip = packet.destination_ip;
    const isSameNetwork = getNetwork(networkObjectIp, $networkObject.getAttribute("data-netmask")) === getNetwork(destination_ip, $networkObject.getAttribute("data-netmask"));
    let destination_mac;

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) {
            throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");
        }

        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) {
            buffer[networkObjectId] = packet;
            let newPacket = new ArpRequest(networkObjectIp, defaultGateway, $networkObject.getAttribute("data-mac"));
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        icmpFlag = false;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    packet.destination_mac = isIpInARPTable(networkObjectId, destination_ip);

    if (!packet.destination_mac) {
        buffer[networkObjectId] = packet;
        let newPacket = new ArpRequest(networkObjectIp, destination_ip, $networkObject.getAttribute("data-mac"));
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
    } else {
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
    }

}

//Procesadores 

async function switchProcessor(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(networkObjectId, switchId, packet);

    const $switchObject = document.getElementById(switchId);

    // Guardamos la MAC de origen si no está en la tabla MAC del switch
    saveMac(switchId, networkObjectId, packet.origin_mac);

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchId, packet.destination_mac)) {

        //terminalMessage(`${switchId}: Saturación de puertos...`);
        order++;

        let devices = getDeviceTable($switchObject.id);

        await Promise.all(devices.map(async (device) => {
            if (device !== networkObjectId) {
                let duplicatePacket = structuredClone(packet);
        
                if (device.startsWith("pc-")) {
                    await packetProcessor_PC(switchId, device, duplicatePacket);
                } else if (device.startsWith("router-")) {
                    await packetProcessor_router(switchId, device, duplicatePacket);
                } else if (device.startsWith("dhcp-server-")) {
                    await packetProcessor_dhcp_server(switchId, device, duplicatePacket);
                } else if (device.startsWith("dhcp-relay-server-")) {
                    await packetProcessor_dhcp_relay_server(switchId, device, duplicatePacket);
                } else if (device.startsWith("dns-server-")) {
                    await packetProcessor_dns_server(switchId, device, duplicatePacket);
                }
            }
        }));

        return;
    }

    let device = getDeviceFromMac(switchId, packet.destination_mac);
    //terminalMessage(`${switchId}: Reenviando paquete a ${device}`);

    let duplicatePacket = structuredClone(packet);

    if (device.startsWith("pc-")) {
        await packetProcessor_PC(switchId, device, duplicatePacket);
    } else if (device.startsWith("router-")) {
        await packetProcessor_router(switchId, device, duplicatePacket);
    } else if (device.startsWith("dhcp-server-")) {
        await packetProcessor_dhcp_server(switchId, device, duplicatePacket);
    } else if (device.startsWith("dhcp-relay-server-")) {
        await packetProcessor_dhcp_relay_server(switchId, device, duplicatePacket);
    } else if (device.startsWith("dns-server-")) {
        await packetProcessor_dns_server(switchId, device, duplicatePacket);
    }

    return;
}

async function packetProcessor_PC(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    //cortafuegos

    if (!firewallProcessorHost(networkObjectId, packet)) return;

    //procesamiento de paquetes

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const isSameNetwork = getNetwork(packet.destination_ip, $networkObject.getAttribute("data-netmask")) === getNetwork(networkObjectIp, $networkObject.getAttribute("data-netmask"));

    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Solicitud ARP ignorada");
            return;
        }

        //terminalMessage(networkObjectId + ": Enviando un Respuesta ARP");
        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {

        //terminalMessage(networkObjectId + ": Respuesta ARP recibida");

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Respuesta ARP invalida");
            return;
        }

        arpFlag = true;


        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        //terminalMessage(networkObjectId + ": El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");

        if (buffer[networkObjectId]) {
            buffer[networkObjectId].destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
            addPacketTraffic(buffer[networkObjectId]);
            await switchProcessor(switchId, networkObjectId, buffer[networkObjectId]);
            //if (buffer[networkObjectId].protocol === "dhcp" && buffer[networkObjectId].type === "release") deleteDhcpInfo(networkObjectId);
            delete buffer[networkObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Solicitud ICMP ignorada");
            return;
        }

        //terminalMessage(networkObjectId + ": Enviando ICMP ECHO REPLY");
        await icmpReplyPacketGenerator(networkObjectId, switchId, networkObjectIp, packet.origin_ip);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "time-exceeded") {
        if (packet.destination_ip !== networkObjectIp) return;
        if (trace) {
            traceReturn = true;
            traceBuffer.push(packet.origin_ip);
        }
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) {
            throw new Error("Destino No Coincide");
        }

        icmpFlag = true;

        if (trace){ //estamos en modo traceroute
            traceBuffer.push(packet.origin_ip);
            traceFlag = true; //confirmamos que hemos encontrado el destino
        }

    }

    if (packet.protocol === "dhcp" && packet.type === "offer") {

        if (packet.chaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo

            ////console.log("DHCP Discover");

            dhcpDiscoverFlag = true;

            //terminalMessage("DHCP OFFER Recibido")

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
            //terminalMessage("DHCP REQUEST Enviado")
            await switchProcessor(switchId, networkObjectId, newPacket);

        }

    }

    if (packet.protocol === "dhcp" && packet.type === "ack") {
        if (packet.chaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo
            //terminalMessage("DHCP ACK Recibido");
            dhcpRequestFlag = true;
            setDhcpInfo(networkObjectId, packet);
        }
    }

    if (packet.protocol === "dns" && packet.type === "reply") {

        if (packet.answer) {
            addDnsCacheEntry(networkObjectId, packet.query, packet.answer_type, packet.answer);
            dnsRequestFlag = true;
        }

        //terminalMessage("DNS Reply Recibido");
        //terminalMessage("Tipo de Registro: " + packet.answer_type + ", Respuesta: " + packet.answer);

    }

    if (packet.protocol === "tcp" && packet.type === "syn") {
        if (packet.destination_ip !== networkObjectIp) return;
        let newPacket = new synAck(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.sport);
        newPacket.ack_number = packet.sequence_number + 1; //el ack debe ser el siguiente número de secuencia
        tcpBuffer[networkObjectId] = newPacket.sequence_number;
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return; //comprobamos si el paquete es para mi respecto a la secuencia TCP
        let newPacket = new Ack(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.sport);
        newPacket.ack_number = packet.sequence_number + 1; //el ack debe ser el siguiente número de secuencia
        newPacket.sequence_number = packet.ack_number - 1; //el paquete debe tener la secuencia correcta
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "tcp" && packet.type === "syn-ack-reply") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if (packet.ack_number !== tcpBuffer[networkObjectId] + 1) return; //comprobamos si el paquete es para mi respecto a la secuencia TCP
        tcpSyncFlag = true;
        return;
    }

    if (packet.protocol === "http" && packet.type === "request") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        if ($networkObject.getAttribute("web-server") === "off") return; //comprobamos si el servidor web esta encendido
        //generamos el paquete
        let newPacket = new httpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
        newPacket.body = $networkObject.getAttribute("web-content");
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "http" && packet.type === "reply") {
        if (packet.destination_ip !== networkObjectIp) return; //comprobamos si el paquete es para mi respecto a ip
        browserBuffer[networkObjectId] = packet;
        return;
    }
}

async function packetProcessor_router(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    //cortafuegos

    if (!firewallProcessorRouter(networkObjectId, packet)) return;

    //bloqueo de paquetes 

    if (packet.destination_ip === "255.255.255.255") { //no hacemos nada con trafico dirigido a broadcast
        //terminalMessage(networkObjectId + ": Paquete DHCP-DISCOVER ignorado");
        return;
    }

    //obtenemos especificaciones del router

    const $routerObject = document.getElementById(networkObjectId);
    const routerObjectMac = $routerObject.getAttribute("data-mac");
    const availableIps = [$routerObject.getAttribute("ip-enp0s3"), $routerObject.getAttribute("ip-enp0s8"), $routerObject.getAttribute("ip-enp0s9")];

    let networkObjectIp; let networkObjectNetmask;

    switch (switchId) {
        case $routerObject.getAttribute("data-switch-enp0s3"):
            networkObjectIp = $routerObject.getAttribute("ip-enp0s3");
            networkObjectNetmask = $routerObject.getAttribute("netmask-enp0s3");
            break;
        case $routerObject.getAttribute("data-switch-enp0s8"):
            networkObjectIp = $routerObject.getAttribute("ip-enp0s8");
            networkObjectNetmask = $routerObject.getAttribute("netmask-enp0s8");
            break;
        case $routerObject.getAttribute("data-switch-enp0s9"):
            networkObjectIp = $routerObject.getAttribute("ip-enp0s9");
            networkObjectNetmask = $routerObject.getAttribute("netmask-enp0s9");
            break;
    }

    //el paquete pasa, tenemos que mirar el TTL y reducirlo

    if (packet.ttl && !availableIps.includes(packet.origin_ip))  {          
        packet.ttl--;
        if (packet.ttl < 1) {
            packet = new IcmpTimeExceeded(networkObjectIp, packet.origin_ip, routerObjectMac, routerObjectMac); //alteracion de la verdad!!!
        }
    }

    //procesamiento del paquete

    const isSameNetwork = getNetwork(packet.destination_ip, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);

    if (availableIps.includes(packet.destination_ip)) { //paquete con destino al router

        if (packet.protocol === "arp" && packet.type === "request") {
            addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
            let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }

        if (packet.protocol === "icmp" && packet.type === "request") {
            let newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }

        if (packet.protocol === "arp" && packet.type === "reply") {
            arpFlag = true;
            addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
            if (buffer[networkObjectId]) {
                buffer[networkObjectId].destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
                addPacketTraffic(buffer[networkObjectId]);
                await switchProcessor(switchId, networkObjectId, buffer[networkObjectId]);
                delete buffer[networkObjectId];
                return;
            }
        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            icmpFlag = true;
            return;
        }

    }

    if (!isSameNetwork || availableIps.includes(packet.origin_ip)) { //paquete con destino otra red o con origen en el router

        //enrutamiento

        const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
        const rows = routingTable.querySelectorAll("tr");

        //reglas de conexion directa

        for (let i = 1; i <= 3; i++) {

            let row = rows[i];
            let cells = row.querySelectorAll("td");
            let ruleNetwork = cells[0].innerHTML;
            let ruleNetmask = cells[1].innerHTML;
            let gateway = cells[2].innerHTML; //ip por esa interfaz
            let ruleInterface = cells[3].innerHTML;

            if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) { //la regla coincide con la red de destino

                //terminalMessage(networkObjectId + ": Reenviando el paquete...")
                const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface); //obtenemos el switch por el que va a saltar
                packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router
                packet.destination_mac = isIpInARPTable(networkObjectId, packet.destination_ip); //cambiamos la mac de destino por la de la tabla de arp

                if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla arp, lo guardamos en el buffer y enviamos un ARP primero
                    //terminalMessage(networkObjectId + ": Destino No Guardado. Enviando ARP por " + packet.destination_ip);
                    buffer[networkObjectId] = packet;
                    let newPacket = new ArpRequest(gateway, packet.destination_ip, routerObjectMac);
                    arpFlag = false;
                    addPacketTraffic(newPacket);
                    await switchProcessor(nextSwitch, networkObjectId, newPacket);
                    return;
                }
                addPacketTraffic(packet);
                await switchProcessor(nextSwitch, networkObjectId, packet);
                //terminalMessage(networkObjectId + ": Reenviando el paquete directamente...")
                return;
            }

        }

        //reglas remotas -> de la 4 hacia delante

        if (rows.length > 4) {

            for (let i = 4; i < rows.length; i++) {

                let row = rows[i];
                let cells = row.querySelectorAll("td");
                let ruleNetwork = cells[0].innerHTML;
                let ruleNetmask = cells[1].innerHTML;
                let gateway = cells[2].innerHTML; //ip por esa interfaz

                if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) { //la regla coincide con la red de destino

                    //terminalMessage(networkObjectId + ": Reenviando el paquete...")
                    let ruleInterface = cells[3].innerHTML; //interfaz por la que se va a saltar
                    let nexthop = cells[4].innerHTML; //ip del siguiente salto
                    const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface);
                    packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router
                    packet.destination_mac = isIpInARPTable(networkObjectId, nexthop);

                    if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
                        //terminalMessage(networkObjectId + ": Destino No Guardado. Enviando ARP por " + nexthop);
                        buffer[networkObjectId] = packet;
                        let newPacket = new ArpRequest(gateway, nexthop, routerObjectMac);
                        arpFlag = false;
                        addPacketTraffic(newPacket);
                        await switchProcessor(nextSwitch, networkObjectId, newPacket);
                        return;
                    }

                    addPacketTraffic(packet);
                    await switchProcessor(nextSwitch, networkObjectId, packet); //mandamos el paquete al switch
                    return;
                }

            }
        }

        //ultimo recurso, miramos la regla por defecto -> en la fila 4

        let row = rows[4];
        let cells = row.querySelectorAll("td");
        let gateway = cells[2].innerHTML;

        if (gateway !== "") { //si no hay regla por defecto, no tenemos que comprobar nada
            let ruleInterface = cells[3].innerHTML;
            let nexthop = cells[4].innerHTML;
            const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface);
            packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router
            packet.destination_mac = isIpInARPTable(networkObjectId, nexthop);

            if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
                //terminalMessage(networkObjectId + ": Destino No Guardado. Enviando ARP por " + nexthop);
                buffer[networkObjectId] = packet;
                let newPacket = new ArpRequest(gateway, nexthop, routerObjectMac);
                arpFlag = false;

                addPacketTraffic(newPacket);
                await switchProcessor(nextSwitch, networkObjectId, newPacket);
                return;
            }

            addPacketTraffic(packet);
            await switchProcessor(nextSwitch, networkObjectId, packet); //mandamos el paquete al switch
            return;

        }

        //no hay regla para enrutar el paquete, lo damos por fallido

        throw new Error("No existe regla para enrutar el paquete en " + routerObjectId);

    }

}

async function packetProcessor_dhcp_server(switchId, serverObjectId, packet) {
    
    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    //cortafuegos

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const serverObjectNetmask = $serverObject.getAttribute("data-netmask");
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);
    const defaultGateway = $serverObject.getAttribute("data-gateway");

    //configuracion del servidor dhcp

    const gatewayOffer = $serverObject.getAttribute("offer-gateway");
    const netmaskOffer = $serverObject.getAttribute("offer-netmask");
    const dnsOffer = $serverObject.getAttribute("offer-dns");
    const networkOffer = getNetwork(gatewayOffer, netmaskOffer); //obtengo la red a la que ofrece

    //comportamiento de pc

    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== serverObjectIp) {
            //terminalMessage(port + ": Solicitud ARP ignorada");
            return;
        }

        //terminalMessage(serverObjectId + ": Enviando un Respuesta ARP");
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "arp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) {
            return;
        }
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        if (buffer[serverObjectId]) {
            buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
            addPacketTraffic(buffer[serverObjectId]);
            await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
            if (buffer[serverObjectId].protocol === "dhcp" && buffer[serverObjectId].type === "release") deleteDhcpInfo(serverObjectId);
            delete buffer[serverObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== serverObjectIp) {
            //terminalMessage(serverObjectId + ": Solicitud ICMP ignorada");
            return;
        }

        //terminalMessage(serverObjectId + ": Enviando ICMP ECHO REPLY");
        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) {
            throw new Error("Destino No Coincide");
        }
        icmpFlag = true;
    }

    //comportamiento de servidor dhcp

    if (packet.protocol === "dhcp" && packet.type === "discover") { //peticion de descubrimiento dhcp

        let offerIP = getRandomIpfromDhcp(serverObjectId) //obtenemos una ip válida del servidor

        let newPacket = new dhcpOffer(
            serverObjectIp, //origin ip
            serverObjectMac, //origin mac
            serverObjectIp, //server ip
            offerIP, //offer ip
            packet.origin_mac, //destination mac
            packet.chaddr, //chaddr
            gatewayOffer, //gateway offer
            netmaskOffer, //netmask offer
            dnsOffer //dns offer
        );

        //comprobamos si proviene de un agente de retransmision

        if (packet.giaddr !== "0.0.0.0") {
            newPacket.destination_ip = packet.giaddr;
            newPacket.giaddr = packet.giaddr;
        } else { //asumimos que el paquete viene de la misma red que el server
            if (networkOffer !== serverObjectNetwork) {
                return;
            }
        }

        //terminalMessage(serverObjectId + ": DHCP OFFER Enviado")
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "dhcp" && packet.type === "request") { //solicitud de ip

        if (packet.siaddr === serverObjectIp) { //el paquete va dirigido al server, lo aceptamos

            //terminalMessage(serverObjectId + ": DHCP REQUEST Recibido")

            let newPacket = new dhcpAck(
                serverObjectMac, //origin mac
                packet.yiaddr, //assigned ip
                serverObjectIp, //server ip
                gatewayOffer, //gateway offer
                netmaskOffer, //netmask offer
                dnsOffer, //dns offer
                packet.hostname //hostname
            );

            newPacket.chaddr = packet.chaddr;

            //comprobamos si proviene de un agente de retransmision

            if (packet.giaddr !== "0.0.0.0") {
                newPacket.destination_ip = packet.giaddr;
                newPacket.giaddr = packet.giaddr;
                newPacket.destination_mac = isIpInARPTable(serverObjectId, defaultGateway);
            }

            addDhcpEntry(serverObjectId, packet.yiaddr, packet.chaddr, packet.hostname);
            //terminalMessage(serverObjectId + ": DHCP ACK Enviado")
            addPacketTraffic(newPacket)
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;
        }

    }

    if (packet.protocol === "dhcp" && packet.type === "release") {
        if (packet.siaddr === serverObjectIp) { //el paquete va dirigido al server, lo aceptamos
            terminalMessage(serverObjectId + ": Eliminando DHCP entry");
            deleteDhcpEntry(serverObjectId, packet.ciaddr);
            return;
        }
    }

    if (packet.protocol === "dhcp" && packet.type === "renew") {

        if (packet.siaddr === serverObjectIp) { //el paquete va dirigido al server, lo aceptamos

            updateDhcpEntry(serverObjectId, packet.ciaddr);

            let newPacket = new dhcpAck(
                serverObjectMac, //origin mac
                packet.ciaddr, //assigned ip
                serverObjectIp, //server ip
                defaultGateway, //gateway offer
                networkOffer, //netmask offer
                dnsOffer, //dns offer
                packet.hostname //hostname
            );

            addPacketTraffic(newPacket);
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;

        }
    }
}

async function packetProcessor_dhcp_relay_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    //cortafuegos

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    //////console.log(`packetProcessor_dhcp_relay_server(${switchId}, ${serverObjectId}, ${packet})`);
    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const mainServer = $serverObject.getAttribute("data-main-server");
    const defaultGateway = $serverObject.getAttribute("data-gateway");

    if (packet.destination_ip === serverObjectIp) { //el paquete es para mi

        //comportamiento de pc

        if (packet.protocol === "arp" && packet.type === "request") {
            if (packet.destination_ip !== serverObjectIp) {
                return;
            }
            addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
            let newPacket = new ArpReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;
        }

        if (packet.protocol === "arp" && packet.type === "reply") {

            if (packet.destination_ip !== serverObjectIp) {
                throw new Error("Destino No Coincide");
            }

            addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
            //terminalMessage(serverObjectId + ": El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");

            if (buffer[serverObjectId]) {
                buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
                addPacketTraffic(buffer[serverObjectId]);
                await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
                delete buffer[serverObjectId];
            }

            return;
        }

        if (packet.protocol === "icmp" && packet.type === "request") {
            if (packet.destination_ip !== serverObjectIp) {
                return;
            }
            let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;
        }

        if (packet.protocol === "icmp" && packet.type === "reply") {
            if (packet.destination_ip !== serverObjectIp) {
                throw new Error("Destino No Coincide");
            }
            icmpFlag = true;
            return;
        }

        //comportamiento de servidor dhcp

        if (packet.protocol === "dhcp" && packet.type === "offer") { //oferta del server principal
            if (packet.giaddr !== serverObjectIp) return; //comprobamos si el offer está dirigido al agente
            //terminalMessage(serverObjectId + " : DHCP-OFFER Recibido. ");
            //reenviamos el paquete al cliente que lo solicitó
            packet.destination_mac = packet.ciaddr;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = serverObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            await switchProcessor(switchId, serverObjectId, packet);
            return;
        }

        if (packet.protocol === "dhcp" && packet.type === "ack") {
            if (packet.giaddr === serverObjectMac) return; //comprobamos si el ack está dirigido al agente
            //cambiamos los campos del paquete
            packet.origin_ip = serverObjectIp;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = serverObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            await switchProcessor(switchId, serverObjectId, packet);
            return;
        }

    }

    if (packet.protocol === "dhcp" && packet.type === "discover") { //peticion de descubrimiento dhcp, la mandamos al server

        //terminalMessage(serverObjectId + ": DHCP DISCOVER Recibido");
        let defaultGatewayMac = isIpInARPTable(serverObjectId, defaultGateway);

        //hago cambios en el paquete para que se envie al servidor

        packet.chaddr = packet.origin_mac;
        packet.destination_ip = mainServer;
        packet.origin_mac = serverObjectMac;
        packet.giaddr = serverObjectIp;
        packet.destination_mac = defaultGatewayMac;
        packet.origin_ip = serverObjectIp;

        if (!defaultGatewayMac) { //no tenemos la ip de la puerta de enlace en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
            buffer[serverObjectId] = packet;
            let newPacket = new ArpRequest(serverObjectIp, defaultGateway, serverObjectMac);
            addPacketTraffic(newPacket);
            await switchProcessor(switchId, serverObjectId, newPacket);
            return;
        }

        //la mac de la puerta de enlace esta en la tabla de arp

        addPacketTraffic(packet);
        await switchProcessor(switchId, serverObjectId, packet);
        return;

    }

    if (packet.protocol === "dhcp" && packet.type === "request") {
        if (packet.giaddr !== serverObjectIp) return; //comprobamos si el request está dirigido al agente
        //cambiamos los campos del paquete
        packet.origin_ip = serverObjectIp;
        packet.destination_ip = mainServer;
        packet.origin_mac = serverObjectMac;
        packet.destination_mac = isIpInARPTable(serverObjectId, defaultGateway);
        addPacketTraffic(packet);
        await switchProcessor(switchId, serverObjectId, packet);
        return;
    }

}

async function packetProcessor_dns_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    ////console.log(packet);

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");

    //comportamiento como equipo normal

    if (packet.protocol === "arp" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp) {
            return;
        }
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) return;
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        if (buffer[serverObjectId]) {
            buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
            addPacketTraffic(buffer[serverObjectId]);
            await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
            delete buffer[serverObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp) {
            return;
        }
        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) return;
        icmpFlag = true;
    }

    //comportamiento como servidor dns

    if (packet.protocol === "dns" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp) return;
        let [answerType, answerTranslation] = isDomainInCache(serverObjectId, packet.query);
        let newPacket = new dnsReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac, packet.query, answerTranslation);
        newPacket.answer_type = answerType;
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

}

//cortafuegos

function firewallProcessorRouter(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicy = $networkObject.getAttribute("firewall-default-policy");
    const firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rules = firewallTable.querySelectorAll("tr");

    const networkObjectIPs = [
        $networkObject.getAttribute("ip-enp0s3"),
        $networkObject.getAttribute("ip-enp0s8"),
        $networkObject.getAttribute("ip-enp0s9")
    ];

    //definimos variables de regla objetivo

    let targetChain;

    if (networkObjectIPs.includes(packet.destination_ip)) {
        targetChain = "INPUT";
    } else {
        targetChain = "FORWARD";
    }

    let i = 1;

    while (i < rules.length) {

        const rule = rules[i];
        const cells = rule.querySelectorAll("td");
        const ruleChain = cells[1].innerHTML;
        const ruleProtocol = cells[2].innerHTML;
        const ruleOrigin = cells[3].innerHTML;
        const ruleDestination = cells[4].innerHTML;
        const rulePort = cells[5].innerHTML;
        const ruleAction = cells[6].innerHTML;

        if (ruleChain === targetChain
            && (ruleProtocol === packet.transport_protocol || ruleProtocol === packet.protocol)
            && (ruleOrigin === "*" || ruleOrigin === packet.origin_ip)
            && (ruleDestination === "*" || ruleDestination === packet.destination_ip)
            && (rulePort === "*" || rulePort === packet.port)
        ) {

            if (ruleAction === "ACCEPT") {
                return true;
            }

            if (ruleAction === "DROP") {
                return false;
            }
        }

        i++;

    }

    // si no hay regla que coincida, se aplica la política por defecto

    return defaultPolicy === "ACCEPT";
}

function firewallProcessorHost(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicy = $networkObject.getAttribute("firewall-default-policy");
    const firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rules = firewallTable.querySelectorAll("tr");
    const networkObjectIP = $networkObject.getAttribute("data-ip");

    //definimos variables de regla objetivo

    let targetChain;

    if (packet.destination_ip === networkObjectIP) {
        targetChain = "INPUT";
    }

    let i = 1;

    while (i < rules.length) {

        const rule = rules[i];
        const cells = rule.querySelectorAll("td");
        const ruleChain = cells[1].innerHTML;
        const ruleProtocol = cells[2].innerHTML;
        const ruleOrigin = cells[3].innerHTML;
        const ruleDestination = cells[4].innerHTML;
        const rulePort = cells[5].innerHTML;
        const ruleAction = cells[6].innerHTML;

        if (ruleChain === targetChain
            && (ruleProtocol === packet.transport_protocol || ruleProtocol === packet.protocol)
            && (ruleOrigin === "*" || ruleOrigin === packet.origin_ip)
            && (ruleDestination === "*" || ruleDestination === packet.destination_ip)
            && (rulePort === "*" || rulePort === packet.port)
        ) {

            if (ruleAction === "ACCEPT") {
                return true;
            }

            if (ruleAction === "DROP") {
                return false;
            }
        }

        i++;

    }

    // si no hay regla que coincida, se aplica la política por defecto
    return defaultPolicy === "ACCEPT";
}

//visualizadores 

async function visualize(originObject, destinationObject, packet) {

    const $originObject = document.getElementById(originObject);
    const $destinationObject = document.getElementById(destinationObject);
    const destinationIp = $destinationObject.getAttribute("data-ip") 
    || $destinationObject.getAttribute("ip-enp0s3") 
    || $destinationObject.getAttribute("ip-enp0s8") 
    || $destinationObject.getAttribute("ip-enp0s9");
    
    if (destinationIp === packet.origin_ip) return; //el paquete es generado por el mismo equipo

    const packetTypeMap = {
        "arp-request": "broadcast",
        "arp-reply": "unicast",
        "dhcp-discover": "dhcp",
        "dhcp-request": "dhcp",
        "dhcp-offer": "dhcp",
        "dhcp-ack": "dhcp",
        "tcp-syn": "tcp",
        "tcp-syn-ack": "tcp",
        "tcp-syn-ack-reply": "tcp",
        "dns-request": "dns",
        "dns-reply": "dns",
    };

    if (ignoreArpTraffic) {
        if (packet.protocol === "arp") return;
    }

    const type = packetTypeMap[`${packet.protocol}-${packet.type}`] || "unicast";

    await movePacket(
        $originObject.style.left, 
        $originObject.style.top, 
        $destinationObject.style.left, 
        $destinationObject.style.top, 
        type
    );

}
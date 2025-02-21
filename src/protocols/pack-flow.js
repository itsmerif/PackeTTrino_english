let buffer = {};
let arpFlag = true;
let icmpFlag = true;
let dhcpDiscoverFlag = false;
let dhcpRequestFlag = false;
let dhcpRenewFlag = false;
let order = 0;

function sp(id, args) {

    let ip; let netmask; let switchId; let destination; let packet; let type;
    const $networkObject = document.getElementById(id);

    cleanPacketTraffic(); //limpiamos la tabla de paquetes

    if (args.length > 4 || args.length < 3) {
        //terminalMessage("Error: Sintaxis: sp [source (only for routers)] <destination> <packet-type>");
        return;
    }

    if (args.length === 3) {
        destination = args[1];
        type = args[2];
        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            //terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }
    }

    if (args.length === 4) {
        destination = args[2];
        type = args[3];
        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            //terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }
    }

    if (!id.startsWith("router-")) { //solo tiene 1 interfaz de red

        if (args.length === 4) {
            //terminalMessage("Error: Origen Personalizable no admitido. Sintaxis: sp [source (only for routers)] <destination> <packet-type>");
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
                    //terminalMessage("Error: La IP de origen introducida no es válida.");
                    return;
            }
        } else {
            ip = $networkObject.getAttribute("ip-enp0s3");
            netmask = $networkObject.getAttribute("netmask-enp0s3");
            switchId = $networkObject.getAttribute("data-switch-enp0s3");
        }
    }

    if (!ip || !netmask || !switchId) {
        //terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    //terminalMessage(id + ": Generando paquete...");

    switch (type) {
        case "arp":
            packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
            switchProcessor(switchId, id, packet);
            return;
        case "icmp-request":
            icmpRequestPacketGenerator(id, switchId, ip, destination);
            return;
        case "icmp-reply":
            icmpReplyPacketGenerator(id, switchId, ip, destination);
            return;
        default:
            //terminalMessage("Error: Tipo de paquete no reconocido.");
            return;
    }

}

function icmpRequestPacketGenerator(networkObjectId, switchId, ip, destination) {

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
            buffer[networkObjectId] = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), "");
            packet = new ArpRequest(ip, defaultGateway, $networkObject.getAttribute("data-mac"));
            arpFlag = false;

            addPacketTraffic(packet);
            switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        packet = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), defaultGatewayMac);
        icmpFlag = false;

        addPacketTraffic(packet);
        switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    //están en la misma red

    destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        //guardamos el paquete en el buffer y enviamos una solicitud ARP primero
        buffer[networkObjectId] = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), "");
        packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
        addPacketTraffic(packet);
        arpFlag = false;
        addPacketTraffic(packet);
        switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new IcmpEchoRequest(ip, destination, $networkObject.getAttribute("data-mac"), destination_mac);
        icmpFlag = false;

        addPacketTraffic(packet);
        switchProcessor(switchId, networkObjectId, packet);
    }

}

function icmpReplyPacketGenerator(networkObjectId, switchId, ip, destination) {

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
            switchProcessor(switchId, networkObjectId, packet);
            return;
        }

        packet = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), defaultGatewayMac);
        icmpFlag = false;

        addPacketTraffic(packet);
        switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    destination_mac = isIpInARPTable(networkObjectId, destination);

    if (!destination_mac) {
        buffer[networkObjectId] = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), "");
        packet = new ArpRequest(ip, destination, $networkObject.getAttribute("data-mac"));
        arpFlag = false;

        addPacketTraffic(packet);
        switchProcessor(switchId, networkObjectId, packet);
    } else {
        packet = new IcmpEchoReply(ip, destination, $networkObject.getAttribute("data-mac"), destination_mac);
        icmpFlag = false;

        addPacketTraffic(packet);
        switchProcessor(switchId, networkObjectId, packet);
    }

}

function dhcpDiscoverGenerator(networkObjectId, switchId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    let packet = new dhcpDiscover(networkObjectMac);
    //terminalMessage(networkObjectId + ": Enviando DHCP Discover");
    addPacketTraffic(packet);
    switchProcessor(switchId, networkObjectId, packet);
    return;
}

function dhcpReleaseGenerator(networkObjectId, switchId) {

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
            switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla ARP
        
        addPacketTraffic(newPacket);
        switchProcessor(switchId, newPacket);
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
        switchProcessor(switchId, networkObjectId,arpRequest);
        return;
    }

    //la mac del server está en la tabla arp

    addPacketTraffic(newPacket);
    switchProcessor(switchId, networkObjectId, newPacket);
    deleteDhcpInfo(networkObjectId);

}

function dhcpRenewGenerator(networkObjectId, switchId) {

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
            switchProcessor(switchId, networkObjectId, arpRequest);
            return;
        }

        //tenemos la puerta de enlace en la tabla de arp
        addPacketTraffic(newPacket);
        switchProcessor(switchId, networkObjectId, newPacket);
        return;

    }

    //el servidor dhcp está en la misma red, enviamos un DHCP Renew

    const destination_mac = isIpInARPTable(networkObjectId, dhcpServerIp);
    newPacket = new dhcpRenew(networkObjectIp, dhcpServerIp, networkObjectMac, destination_mac, networkObjectId);

    if (!destination_mac) { //la mac del servidor no está en la tabla arp
        buffer[networkObjectId] = newPacket;
        let arpRequest = new ArpRequest(networkObjectIp, dhcpServerIp, networkObjectMac);
        addPacketTraffic(arpRequest);
        switchProcessor(switchId, networkObjectId, arpRequest);
        return;
    }

    //la mac del servidor está en la tabla arp

    addPacketTraffic(newPacket);
    switchProcessor(switchId, networkObjectId, newPacket);

}

function switchProcessor(switchId, networkObjectId, packet) {

    const $switchObject = document.getElementById(switchId);

    // Guardamos la MAC de origen si no está en la tabla MAC del switch
    saveMac(switchId, networkObjectId, packet.origin_mac);

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchId, packet.destination_mac)) {

        //terminalMessage(`${switchId}: Saturación de puertos...`);
        order++;

        let devices = getDeviceTable($switchObject.id);

        for (let device of devices) {
            if (device !== networkObjectId) {

                let duplicatePacket = structuredClone(packet);

                if (device.startsWith("pc-")) {
                    packetProcessor_PC(switchId, device, duplicatePacket);          
                } else if (device.startsWith("router-")) {
                    packetProcessor_router(switchId, device, duplicatePacket);
                } else if (device.startsWith("dhcp-server-")) {
                    packetProcessor_dhcp_server(switchId, device, duplicatePacket);
                } else if (device.startsWith("dhcp-relay-server-")) {
                    packetProcessor_dhcp_relay_server(switchId, device, duplicatePacket);
                }
            }
        }

        return;
    }

    let device = getDeviceFromMac(switchId, packet.destination_mac);
    //terminalMessage(`${switchId}: Reenviando paquete a ${device}`);

    let duplicatePacket = structuredClone(packet);

    if (device.startsWith("pc-")) {
        packetProcessor_PC(switchId, device, duplicatePacket);          
    } else if (device.startsWith("router-")) {
        packetProcessor_router(switchId, device, duplicatePacket);
    } else if (device.startsWith("dhcp-server-")) {
        packetProcessor_dhcp_server(switchId, device, duplicatePacket);
    } else if (device.startsWith("dhcp-relay-server-")) {
        packetProcessor_dhcp_relay_server(switchId, device, duplicatePacket);
    }

    return;
}

function packetProcessor_PC(switchId, networkObjectId, packet) {

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
        switchProcessor(switchId, networkObjectId, newPacket);
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
            switchProcessor(switchId, networkObjectId, buffer[networkObjectId]);
            if (buffer[networkObjectId].protocol === "dhcp" && buffer[networkObjectId].type === "release") deleteDhcpInfo(networkObjectId);
            delete buffer[networkObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Solicitud ICMP ignorada");
            return;
        }

        //terminalMessage(networkObjectId + ": Enviando ICMP ECHO REPLY");
        icmpReplyPacketGenerator(networkObjectId, switchId, networkObjectIp, packet.origin_ip);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "reply") {

        if (packet.destination_ip !== networkObjectIp) {
            //terminalMessage(networkObjectId + ": Destino No Coincide");
            throw new Error("Destino No Coincide");
        }
        //terminalMessage(networkObjectId + ": ICMP ECHO REPLY recibido.");


        icmpFlag = true;
    }

    if (packet.protocol === "dhcp" && packet.type === "offer") {

        if (packet.chaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo

            console.log("DHCP Discover");

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
            switchProcessor(switchId, networkObjectId, newPacket);

        }

    }

    if (packet.protocol === "dhcp" && packet.type === "ack") {
        if (packet.chaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo
            //terminalMessage("DHCP ACK Recibido");
            dhcpRequestFlag = true;
            setDhcpInfo(networkObjectId, packet);
        }
    }
}

function packetProcessor_router(switchId, networkObjectId, packet) {

    //el firewall evalua el paquete

    if (!firewallProcessor(networkObjectId, packet)) return;

    //bloqueo de paquetes 

    if (packet.destination_ip === "255.255.255.255") { //no hacemos nada con trafico dirigido a broadcast
        //terminalMessage(networkObjectId + ": Paquete DHCP-DISCOVER ignorado");
        return;
    }

    //obtenemos especificaciones del router

    const $routerObject = document.getElementById(networkObjectId);
    const routerObjectMac = $routerObject.getAttribute("data-mac");
    const availableNetworks = [
        getNetwork($routerObject.getAttribute("ip-enp0s3"), $routerObject.getAttribute("netmask-enp0s3")),
        getNetwork($routerObject.getAttribute("ip-enp0s8"), $routerObject.getAttribute("netmask-enp0s8")),
        getNetwork($routerObject.getAttribute("ip-enp0s9"), $routerObject.getAttribute("netmask-enp0s9"))
    ];

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

    const isSameNetwork = getNetwork(packet.destination_ip, networkObjectNetmask) === getNetwork(networkObjectIp, networkObjectNetmask);


    if (packet.destination_ip === networkObjectIp) { //el destinoIp del paquete es el propio router -> actúa como un equipo normal
        if (packet.protocol === "arp" && packet.type === "request") {

            if (packet.destination_ip !== networkObjectIp) {
                //terminalMessage(networkObjectId + ": Solicitud ARP ignorada");
                return;
            }

            //terminalMessage(networkObjectId + ": Enviando un Respuesta ARP");
            addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
            let newPacket = new ArpReply(networkObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            switchProcessor(switchId, networkObjectId, newPacket);
            return;
        }
        if (packet.protocol === "icmp" && packet.type === "request") {

            if (packet.destination_ip !== networkObjectIp) {
                //terminalMessage(networkObjectId + ": Solicitud ICMP ignorada");
                return;
            }

            //terminalMessage(networkObjectId + ": Enviando ICMP ECHO REPLY");
            let newPacket = new IcmpEchoReply(networkObjectIp, packet.origin_ip, routerObjectMac, packet.origin_mac);
            addPacketTraffic(newPacket);
            switchProcessor(switchId, networkObjectId, newPacket);
            return;

        }
        if (packet.protocol === "arp" && packet.type === "reply") {

            if (packet.destination_ip !== networkObjectIp) {
                //terminalMessage(networkObjectId + ": Respuesta ARP invalida");
                return;
            }

            arpFlag = true;
            addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
            //terminalMessage(networkObjectId + ": El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");

            if (buffer[networkObjectId]) {
                buffer[networkObjectId].destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
                //terminalMessage("Enviando paquete en el buffer: " + buffer[networkObjectId].protocol);
                addPacketTraffic(buffer[networkObjectId]);
                switchProcessor(switchId, networkObjectId, buffer[networkObjectId]);
                delete buffer[networkObjectId];
                return;
            }

        }
    }

    
    if (!isSameNetwork) { //paquete con destino otra red

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
                    switchProcessor(nextSwitch, networkObjectId, newPacket);
                    return;
                }
                addPacketTraffic(packet);
                switchProcessor(nextSwitch, networkObjectId, packet);
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
                        switchProcessor(nextSwitch, networkObjectId, newPacket);
                        return;
                    }

                    addPacketTraffic(packet);
                    switchProcessor(nextSwitch, networkObjectId, packet); //mandamos el paquete al switch
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
                switchProcessor(nextSwitch, networkObjectId, newPacket);
                return;
            }

            addPacketTraffic(packet);
            switchProcessor(nextSwitch, networkObjectId, packet); //mandamos el paquete al switch
            return;

        }

        //no hay regla para enrutar el paquete, lo damos por fallido

        throw new Error("No existe regla para enrutar el paquete en " + routerObjectId);

    }

}

function packetProcessor_dhcp_server(switchId, serverObjectId, packet) {

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const serverObjectNetmask = $serverObject.getAttribute("data-netmask");
    const serverObjectNetwork = getNetwork(serverObjectIp, serverObjectNetmask);
    const defaultGateway = $serverObject.getAttribute("data-gateway");

    //configuracion del servidor dhcp

    const gatewayOffer = $serverObject.getAttribute("offer-gateway");
    const netmaskOffer = $serverObject.getAttribute("offer-netmask");
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
        switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== serverObjectIp) {
            //terminalMessage(serverObjectId + ": Solicitud ICMP ignorada");
            return;
        }

        //terminalMessage(serverObjectId + ": Enviando ICMP ECHO REPLY");
        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        switchProcessor(switchId, serverObjectId, newPacket);
        return;

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
            netmaskOffer //netmask offer
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
        switchProcessor(switchId, serverObjectId, newPacket);
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
            switchProcessor(switchId, serverObjectId, newPacket);
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
                packet.hostname //hostname
            );

            addPacketTraffic(newPacket);
            switchProcessor(switchId, serverObjectId, newPacket);
            return;

        }
    }
}

function packetProcessor_dhcp_relay_server(switchId, serverObjectId, packet) {

    //console.log(`packetProcessor_dhcp_relay_server(${switchId}, ${serverObjectId}, ${packet})`);
    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const mainServer = $serverObject.getAttribute("data-main-server");
    const defaultGateway = $serverObject.getAttribute("data-gateway");

    if (packet.destination_ip === serverObjectIp) { //el paquete es para mi

        if (packet.protocol === "arp" && packet.type === "reply") {

            if (packet.destination_ip !== serverObjectIp) {
                throw new Error("Destino No Coincide");
            }

            addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
            //terminalMessage(serverObjectId + ": El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");

            if (buffer[serverObjectId]) {
                buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
                addPacketTraffic(buffer[serverObjectId]);
                switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
                delete buffer[serverObjectId];
            }

            return;
        }

        if (packet.protocol === "dhcp" && packet.type === "offer") { //oferta del server principal
            if (packet.giaddr !== serverObjectIp) return; //comprobamos si el offer está dirigido al agente
            //terminalMessage(serverObjectId + " : DHCP-OFFER Recibido. ");
            //reenviamos el paquete al cliente que lo solicitó
            packet.destination_mac = packet.ciaddr;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = serverObjectMac;
            packet.destination_mac = packet.chaddr;
            addPacketTraffic(packet);
            switchProcessor(switchId, serverObjectId, packet);
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
            switchProcessor(switchId, serverObjectId, packet);
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
            switchProcessor(switchId, serverObjectId, newPacket);
            return;
        }

        //la mac de la puerta de enlace esta en la tabla de arp

        addPacketTraffic(packet);
        switchProcessor(switchId, serverObjectId, packet);
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
        switchProcessor(switchId, serverObjectId, packet);
        return;
    }

}

function firewallProcessor(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
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

    //console.log(targetChain);

    for (let i = 1; i < rules.length; i++) {
        const rule = rules[i];
        const cells = rule.querySelectorAll("td");
        const ruleChain = cells[1].innerHTML;
        const ruleProtocol = cells[2].innerHTML;
        const ruleOrigin = cells[3].innerHTML;
        const ruleDestination = cells[4].innerHTML;
        const rulePort = cells[5].innerHTML;
        const ruleAction = cells[6].innerHTML;

        if (ruleChain === targetChain 
            && ruleProtocol === packet.transport_protocol
            && (ruleOrigin === "*" || ruleOrigin === packet.origin_ip)
            && (ruleDestination === "*" || ruleDestination === packet.destination_ip)
            && (rulePort === "*" || rulePort === packet.port)
        ) {
            if (ruleAction === "ACCEPT") {
                return true;
            } else if (ruleAction === "DROP") {
                return false;
            }
        }
    }

    // si no hay regla que coincida, se aplica política por defecto ACCEPT
    return true;
}
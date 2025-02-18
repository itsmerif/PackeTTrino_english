let buffer = {};
let arpFlag = true;
let icmpFlag =  true;

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
    addPacketTraffic(packet);
    switchProcessor(switchId, networkObjectId, packet);
}

function switchProcessor(switchId, networkObjectId, packet) {

    const $switchObject = document.getElementById(switchId);

    //guardamos la mac de origen si no la tenemos en la tabla MAC del switch

    saveMac(switchId, networkObjectId, packet.origin_mac);

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable($switchObject.id, packet.destination_mac)) {
        
        //terminalMessage(switchId + ": Saturación de puertos...");

        let devices = getDeviceTable($switchObject.id);

        for (let i = 0; i < devices.length; i++) {

            let device = devices[i];

            if (device !== networkObjectId) { //no saturamos el puerto de origen
                packetProcessor(switchId, device, packet);
            }

        }
        
        return;
    }

    //la mac de destino está en la tabla MAC del switch

    let device = getDeviceFromMac($switchObject.id, packet.destination_mac);
    //terminalMessage(switchId + ": Reenviando paquete a " + device);
    packetProcessor(switchId, device, packet);

}

function packetProcessor(switchId, networkObjectId, packet) {

    if (networkObjectId.startsWith("pc-")) {
        packetProcessor_PC(switchId, networkObjectId, packet);
    }

    if (networkObjectId.startsWith("router-")) {
        packetProcessor_router(switchId, networkObjectId, packet);
    }

    if (networkObjectId.startsWith("server-")){
        packetProcessor_dhcp_server(switchId, networkObjectId, packet);
    }

}

function packetProcessor_PC(switchId, networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const isSameNetwork = getNetwork(packet.destination_ip, $networkObject.getAttribute("data-netmask")) === getNetwork(networkObjectIp, $networkObject.getAttribute("data-netmask"));

    if (packet.protocol === "arp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) {
            ////terminalMessage(port + ": Solicitud ARP ignorada");
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
            ////terminalMessage(port + ": Respuesta ARP invalida");
            return;
        }

        arpFlag = true;
        

        addARPEntry(networkObjectId, packet.origin_ip, packet.origin_mac);
        //terminalMessage(networkObjectId + ": El equipo con ip " + packet.origin_ip + " ha sido agregado a la tabla de ARP");

        if (buffer[networkObjectId]) {
            buffer[networkObjectId].destination_mac = isIpInARPTable(networkObjectId, packet.origin_ip);
            //terminalMessage("Enviando paquete en el buffer: " + buffer[networkObjectId].protocol)
            addPacketTraffic(buffer[networkObjectId]);
            switchProcessor(switchId, networkObjectId, buffer[networkObjectId]);
            delete buffer[networkObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {

        if (packet.destination_ip !== networkObjectIp) {
            ////terminalMessage(port + ": Solicitud ICMP ignorada");
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
        if (packet.ciaddr === networkObjectMac) { //hemos detectado una oferta para nuestro equipo
            terminalMessage("DHCP OFFER Recibido")
            let newPacket = new dhcpRequest(networkObjectMac, packet.yiaddr, packet.siaddr);
            addPacketTraffic(newPacket);
            terminalMessage("DHCP REQUEST Enviado")
            switchProcessor(switchId, networkObjectId);
        }
    }

}

function packetProcessor_router(switchId, networkObjectId, packet) {

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

    //router actuando como equipo normal

    if (packet.destination_ip === networkObjectIp) { //el paquete es para mi

        if (packet.protocol === "arp" && packet.type === "request") {

            if (packet.destination_ip !== networkObjectIp) {
                ////terminalMessage(port + ": Solicitud ARP ignorada");
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
                ////terminalMessage(port + ": Solicitud ICMP ignorada");
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
                ////terminalMessage(port + ": Respuesta ARP invalida");
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
            }

        }
    }

    if (!isSameNetwork) { //paquete a reenviar

        //no reenviamos trafico de tipo ARP
        
        if (packet.protocol === "arp") {
            //terminalMessage(networkObjectId + ": El paquete es de tipo ARP, no se puede enrutar");
            throw new Error("El paquete es de tipo ARP, no se puede enrutar");
        }

        //no reenviamos trafico dirigido a broadcast

        if (packet.destination_ip = "255.255.255.255") {
            throw new Error("El paquete tiene broadcast como dirección IP, se descarta");
        }

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

                const nextSwitch = $routerObject.getAttribute("data-switch-" + ruleInterface); //obtenemos el switch que va a saltar

                packet.origin_mac = routerObjectMac; //cambiamos la mac del origen por la del router

                packet.destination_mac = isIpInARPTable(networkObjectId, packet.destination_ip);

                if (!packet.destination_mac) { //no tenemos la mac del destino en nuestra tabla de arp, lo guardamos en el buffer y enviamos un ARP primero
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

function packetProcessor_dhcp_server(switchId, networkObjectId, packet){

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("data-ip");


    if (packet.destination_ip === networkObjectIp) { //logica de equipo normal
        //logica de arp e icmp
    }

    if (packet.protocol === "dhcp" && packet.type === "discover"){ //peticion de descubrimiento dhcp
        let offerIP = getRandomIpfromDhcp(networkObjectId) //obtenemos una ip válida del servidor
        let newPacket = new dhcpOffer(networkObjectIp, networkObjectMac, networkObjectIp, offerIP, packet.origin_mac);
        addPacketTraffic(newPacket);
        switchProcessor(switchId, networkObjectId, newPacket);
        return;
    }

    if (packet.protocol === "dhcp" && packet.type === "request")  { //solicitud de ip

        if (packet.siaddr === networkObjectIp)  { //el paquete va dirigido al server, lo aceptamos

           let newPacket = new dhcpAck(networkObjectMac, packet.yiaddr, 3600);
           addPacketTraffic(newPacket)

        }

    }

}

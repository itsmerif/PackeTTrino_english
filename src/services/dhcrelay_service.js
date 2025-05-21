async function dhcrelay_service(agentObjectId, packet, interface) {

    //atributos del agente de retransmision
    const $agentObject = document.getElementById(agentObjectId);
    const agentObjectMac = $agentObject.getAttribute(`mac-${interface}`);
    const agentObjectIp = $agentObject.getAttribute(`ip-${interface}`);
    const availableIps = getAvailableIps(agentObjectId);

    //atributos del servicio de retransmision
    const mainServer = $agentObject.getAttribute("dhcrelay-main-server");
    const listenOnInterfaces = $agentObject.getAttribute("dhcrelay-listen-on-interfaces").split(",");
    const isDhcpRelayOn = $agentObject.getAttribute("dhcrelay") === "true";

    if (!isDhcpRelayOn) return; //<-- si el DHCP Relay no esta activo, no se procesa nada

    if (!listenOnInterfaces.includes(interface)) return; //<-- si el DHCP Relay no esta configurado para el interfaz, no se procesa nada
    
    if (packet.destination_ip === "255.255.255.255") { //paquete viene de un cliente 

        if (packet.type === "discover") {
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = mainServer;
            packet.origin_mac = agentObjectMac;
            packet.giaddr = agentObjectIp;
        }

        if (packet.type === "request") {
            if (packet.giaddr !== agentObjectIp) return;
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = mainServer;
            packet.origin_mac = agentObjectMac;
        }

        packet.destination_mac = ""; //<-- se inicializa vacía, a rellenar por el enrutamiento
        return packet;

    }

    if (availableIps.includes(packet.destination_ip)) { //paquete viene de un servidor

        if (!availableIps.includes(packet.giaddr)) return;

        if (packet.type === "offer") {
            packet.destination_mac = packet.ciaddr;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = packet.chaddr;
        }

        if (packet.type === "ack") {
            packet.origin_ip = agentObjectIp;
            packet.destination_ip = "255.255.255.255";
            packet.origin_mac = agentObjectMac;
            packet.destination_mac = packet.chaddr;
        }

        return packet;

    }

}
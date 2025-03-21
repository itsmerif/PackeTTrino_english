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
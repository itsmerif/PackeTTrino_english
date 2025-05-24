async function visualize(originObject, destinationObjectId, packet) {

    if (getAvailableIps(destinationObjectId).includes(packet.origin_ip)) return; //el paquete es generado por el mismo equipo

    const $originObject = document.getElementById(originObject);
    const $destinationObject = document.getElementById(destinationObjectId);
    
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

    if (ignoreArpTraffic && packet.protocol === "arp") return;

    const type = packetTypeMap[`${packet.protocol}-${packet.type}`] || "unicast";

    await movePacket(
        $originObject.style.left, 
        $originObject.style.top, 
        $destinationObject.style.left, 
        $destinationObject.style.top, 
        type
    );

}
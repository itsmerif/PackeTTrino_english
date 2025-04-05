async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const switchId = $networkObject.getAttribute("data-switch");

    if (packet.destination_ip !== networkObjectIp) return;

    if ($networkObject.getAttribute("apache") === "off") return;

    let newPacket = new httpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
    newPacket.body = $networkObject.getAttribute("web-content");
    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);
    
}
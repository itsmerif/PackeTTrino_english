async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const isApacheOn = $networkObject.getAttribute("apache") === "true";

    if (packet.destination_ip !== networkObjectIp) return;

    if (!isApacheOn) return;

    let newPacket = new httpReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac);
    newPacket.body = $networkObject.getAttribute("web-content");
    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);
    
}
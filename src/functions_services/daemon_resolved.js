async function resolved_service(networkObjectId, packet) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    if (packet.destination_ip !== networkObjectIp) return;
    if (packet.type !== "reply") return;
    dnsRequestFlag = true;
    buffer[networkObjectId] = packet;
}
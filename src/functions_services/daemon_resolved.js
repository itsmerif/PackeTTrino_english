async function resolved_service(networkObjectId, packet) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true";

    if (packet.destination_ip !== networkObjectIp) return;

    if (!isResolvedOn) return;

    if (packet.type !== "reply") return;

    dnsRequestFlag = true;

    buffer[networkObjectId] = packet;

}
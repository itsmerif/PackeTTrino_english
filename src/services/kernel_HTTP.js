async function httpRequestPacketGenerator(networkObjectId, destinationIp) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    let packet = new httpRequest(networkObjectIp, destinationIp, networkObjectMac, "", 80, "GET");
    await hostRouting(networkObjectId, packet);
}
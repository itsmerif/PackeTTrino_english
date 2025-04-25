async function tcpSynPacketGenerator(networkObjectId, destination, port) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    tcpSyncFlag[networkObjectId] = false;
    let packet = new syn(networkObjectIp, destination, networkObjectMac, "", port);
    tcpBuffer[networkObjectId] = packet.sequence_number;
    await hostRouting(networkObjectId, packet);
}
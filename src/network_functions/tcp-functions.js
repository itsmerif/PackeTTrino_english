async function tcp(networkObjectId, destination, port) {
    tcpSyncFlag = false;
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch");
    await tcpSynPacketGenerator(networkObjectId, switchId, destination, port);
}
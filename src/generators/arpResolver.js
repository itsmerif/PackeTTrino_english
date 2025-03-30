async function arpResolve(networkObjectId, destinationIp)  {
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch");
    const originIp = $networkObject.getAttribute("data-ip");
    const originMac = $networkObject.getAttribute("data-mac");
    let packet = new ArpRequest(originIp, destinationIp, originMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
}
async function arpResolve(networkObjectId, destinationIp)  {
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const originIp = $networkObject.getAttribute("ip-enp0s3");
    const originMac = $networkObject.getAttribute("mac-enp0s3");
    let packet = new ArpRequest(originIp, destinationIp, originMac);
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
}
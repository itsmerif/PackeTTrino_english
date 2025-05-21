async function arpResolve(networkObjectId, destinationIp, interface = "enp0s3")  {
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-" + interface);
    const originIp = $networkObject.getAttribute("ip-" + interface);
    const originMac = $networkObject.getAttribute("mac-" + interface);
    let packet = new ArpRequest(originIp, destinationIp, originMac);
    arpFlag[networkObjectId] = false;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    if (arpFlag[networkObjectId] === false) return false;
    if (buffer[networkObjectId]) return buffer[networkObjectId].origin_mac;   
    return false;
}
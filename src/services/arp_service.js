async function arpResolve(networkObjectId, destinationIp, iface = "enp0s3")  {
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-" + iface);
    const originIp = $networkObject.getAttribute("ip-" + iface);
    const originMac = $networkObject.getAttribute("mac-" + iface);
    let packet = new ArpRequest(originIp, destinationIp, originMac);
    arpFlag[networkObjectId] = false;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);
    if (arpFlag[networkObjectId] === false) return false;
    if (buffer[networkObjectId]) return buffer[networkObjectId].origin_mac;   
    return false;
}
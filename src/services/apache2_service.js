async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isApacheOn = $networkObject.getAttribute("apache2") === "true";
    const listenOnPort = parseInt($networkObject.getAttribute("apachePort"));
    const listenOnIp = $networkObject.getAttribute("apacheIp");

    if (!isApacheOn) return;
    if (listenOnIp !== "*" && listenOnIp !== packet.destination_ip) return;
    if (listenOnPort !== packet.dport) return;

    const apacheContent = getApacheWebContent(networkObjectId, packet.dport, packet.destination_ip);

    let newPacket = new httpReply(
        networkObjectIp, //ip del origen
        packet.origin_ip, //ip del destino
        networkObjectMac, //mac del origen
        packet.origin_mac, //mac del destino
        packet.dport, //puerto del origen
        packet.sport //puerto del destino
    );

    newPacket.body = apacheContent;

    return newPacket;

}
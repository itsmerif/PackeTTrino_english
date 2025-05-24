async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = getInterfaces($networkObject.id)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectIp}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectIp}`);
    const apacheContent = getApacheWebContent(networkObjectId);

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
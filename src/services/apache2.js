async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const isApacheOn = $networkObject.getAttribute("apache") === "true";
    const networkObjectFyleSystem = new FileSystem($networkObject);

    let newPacket = new httpReply(
        networkObjectIp, //ip del origen
        packet.origin_ip, //ip del destino
        networkObjectMac, //mac del origen
        packet.origin_mac, //mac del destino
        packet.dport, //puerto del origen
        packet.sport //puerto del destino
    );

    let directoryPath = pathBuilder("/var/www/html/index.html");
    let fileName = directoryPath.pop();

    newPacket.body = networkObjectFyleSystem.open(fileName, directoryPath); //<-- obtenemos el contenido del archivo index.html

    return newPacket;  
}
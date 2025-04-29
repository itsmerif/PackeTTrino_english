async function httpRequestPacketGenerator(networkObjectId, destinationIp, source_port, destination_port) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");

    let packet = new httpRequest(
        networkObjectIp, //ip del origen
        destinationIp, //ip del destino
        networkObjectMac, //mac del origen
        "", //mac del destino
        source_port, //puerto del origen
        destination_port, //puerto del destino
        "GET" //método
    );

    await hostRouting(networkObjectId, packet);
}
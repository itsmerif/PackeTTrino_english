async function tcpSynPacketGenerator(networkObjectId, destination, source_port , destination_port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    tcpSyncFlag[networkObjectId] = false;

    let packet = new syn(
        networkObjectIp, //ip del origen
        destination, //ip del destino
        networkObjectMac, //mac del origen
        "", //mac del destino
        source_port, //puerto de origen
        destination_port //puerto de destino
    );

    tcpBuffer[networkObjectId] = packet.sequence_number; // <--- almacenamos el número de secuencia en el buffer TCP del equipo

    await hostRouting(networkObjectId, packet);

}
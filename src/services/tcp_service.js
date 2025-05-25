async function tcpSynPacketGenerator(networkObjectId, destination, source_port , destination_port) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);

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

    await routing(networkObjectId, packet, true);

}
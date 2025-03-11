function tcp(networkObjectId, destination, port) {

    tcpSyncFlag = false;
    
    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch");

    tcpSynPacketGenerator(networkObjectId, switchId, destination, port);

    setTimeout(() => {

        if (!tcpSyncFlag) {
            //terminalMessage(networkObjectId + ": No se pudo establecer la conexión.");
            return;
        }

        //terminalMessage(networkObjectId + ": Conexión establecida con éxito.");

    },500);


}
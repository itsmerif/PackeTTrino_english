async function command_ping(networkObjectId, destination) {

    const $networkObject = document.getElementById(networkObjectId);

    const stateHandler = {
        0: () => pingSuccess(destination),
        1: () => terminalMessage(`ping: ${destination}: Unknown name or service.`, networkObjectId),
        2: () => terminalMessage(`ping: ${destination}: Invalid IP address.`, networkObjectId),
        3: () => pingFailure(destination),
        4: () => terminalMessage(`ping: ${destination}: Network unreachable.`, networkObjectId)
    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

        let stateCode = await ping(networkObjectId, destination); //<-- realizamos el ping obteniendo el codigo de estado
        stateHandler[stateCode](); //<-- ejecutamos el manejador de estados
    
    if (visualToggle) await maximizeTerminal();

}

async function quickPing(id) {

    const $networkObject = document.getElementById(id);
    const $board = document.querySelector(".board");    
    const networkObjectIp = getAvailableIps($networkObject.id)[0];

    if (!networkObjectIp) {
        bodyComponent.render(popupMessage("<span>Error: </span> Object IP address not found " + id));
        return;
    }

    if (quickPingObject === "") {        
        quickPingObject = id;
        createPacketIndicator(id);
        return;
    }

    createPacketIndicator(id);

    visualToggle =  true;

        await ping(quickPingObject, networkObjectIp);     
        $board.querySelectorAll(".pack-cursor").forEach(cursor => {cursor.remove();});
        quickPingObject = "";

    visualToggle = false;


}

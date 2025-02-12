async function dhcp(networkObjectId, visual = false) {

    const networkObject = document.getElementById(networkObjectId); //obtenemos el elemento
    const switchObjectId = networkObject.getAttribute("data-switch"); //obtenemos el id del switch al que está conectado
    const switchObject = document.getElementById(switchObjectId); //obtenemos el switch

    //primero el equipo realiza un broadcast con DHCPDISCOVER

    if (visual) {
        movePacket(networkObject.style.left, networkObject.style.top, switchObject.style.left, switchObject.style.top, "discover");
        await waitForMove();
    }

    broadcastSwitch(switchObjectId, networkObjectId); //broadcast del switch a todos los dispositivos conectados excepto el origen
    await waitForMove();

    if (!isDHCPinNetwork(switchObjectId)) { //no hay un servidor DHCP en la red
        return;
    }

    const serverObjectId = isDHCPinNetwork(switchObjectId); //obtenemos el id del servidor DHCP
    const serverObject = document.getElementById(serverObjectId); //obtenemos el servidor DHCP

    if (visual) { //el server envia por broadcast DHCPOFFER
        movePacket(serverObject.style.left, serverObject.style.top, switchObject.style.left, switchObject.style.top, "offer");
        await waitForMove();
    }

    broadcastSwitch(switchObjectId, serverObjectId); //broadcast del switch a todos los dispositivos conectados excepto el origen
    await waitForMove();

    if (visual) { 

        //el equipo responde con DHCPREQUEST

        movePacket(networkObject.style.left, networkObject.style.top, switchObject.style.left, switchObject.style.top, "request");
        await waitForMove();
        broadcastSwitch(switchObjectId, networkObjectId); //broadcast del switch a todos los dispositivos conectados excepto el origen
        await waitForMove();

        //el servidor responde con DHCPACK

        movePacket(serverObject.style.left, serverObject.style.top, switchObject.style.left, switchObject.style.top, "ack");
        await waitForMove();
        movePacket(switchObject.style.left, switchObject.style.top, networkObject.style.left, networkObject.style.top, "ack");
        await waitForMove();
    }
    
}
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

function getRandomIpfromDhcp(serverObjectId) {
    // Obtengo el servidor
    const serverObject = document.getElementById(serverObjectId);

    // Obtengo el rango de IPs que ofrece
    const rangeStart = serverObject.getAttribute("data-range-start"); // 192.168.1.100
    const rangeEnd = serverObject.getAttribute("data-range-end");     // 192.168.1.200

    // Convertimos las IPs de rango a binario
    let rangeStartBinary = ipToBinary(rangeStart);
    let rangeEndBinary = ipToBinary(rangeEnd);

    // Convertimos binario a número entero para facilitar el cálculo
    let startInt = parseInt(rangeStartBinary, 2);
    let endInt = parseInt(rangeEndBinary, 2);

    // Generamos una IP aleatoria dentro del rango
    let randomInt = Math.floor(Math.random() * (endInt - startInt + 1)) + startInt;
    let randomBinary = randomInt.toString(2).padStart(32, '0');
    let randomIp = binaryToIp(randomBinary);

    return randomIp;
}

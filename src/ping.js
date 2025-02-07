function ping(originIP, destinationIP) {

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
    const arpTable = getARPTable(originId);
    const NetworkOriginObject = document.getElementById(originId);
    const NetworkOriginObjectMac = NetworkOriginObject.getAttribute("data-mac");
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchIdentity);
    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");
    let macs = [];
    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    // Compruebo que el equipo origen está configurado

    if (!originIP) {
        ping_f(originIP);
        return;
    }

    // si el origen y el destino es el mismo, es un loopback

    if (originIP === destinationIP) {
        ping_s(originIP);
        return;
    }

    // Buscamos la IP en la tabla ARP del equipo origen

    for (let i = 0; i < arpTable.length; i++) {
        const arpRow = arpTable[i];
        const mac = arpRow[1];
        const ip = arpRow[0];

        if (ip === destinationIP) {
            const macEncontrada = mac; // Hemos encontrado la mac del equipo destino
            for (let i = 0; i < macs.length; i++) { // Ahora buscamos la mac en la tabla del switch
                const mac = macs[i];
                if (mac === macEncontrada) { // Si la encontramos, bingo, existe la conexión
                    ping_s(originIP);
                    return;
                }
            }
        }
    }

    //si no está en la tabla ARP del equipo origen, mandamos al switch a mirar los equipos conectados

    for (let i = 0; i < macs.length; i++) {

        const mac = macs[i];
        const networkObject = document.querySelector(`[data-mac="${mac}"]`);
        const networkObjectId = networkObject.id;
        let ip = "";

        if (networkObjectId.startsWith("pc-") || networkObjectId.startsWith("server-")) {

            ip = networkObject.getAttribute("data-ip");

        } else if (networkObjectId.startsWith("router-")) {

            ip = getRouterIp(networkObjectId, switchIdentity);
            
        }

        if (destinationIP === ip) { // Bingo, hemos encontrado el equipo destino
            addARPEntry(originId, destinationIP, mac);
            ping_s(originIP);
            return;
        }
    }
    
    ping_f(originIP); //si no hemos encontrado nada, damos el ping por fallido
    return;
}

function ping_s(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 1000);

}

function ping_f(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 1000);

}
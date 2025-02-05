function ping( originIP, destinationIP ) {

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
    const arpTable = getARPTable(originId);
    const NetworkOriginObject = document.getElementById(originId);
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchIdentity);
    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");
    let macs = [];
    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    //compruebo que el equipo origen está configurado

    if (!originIP) {
        return "Error: IP no configurada.";
    }

    //ahora buscamos la ip en la tabla ARP del equipo origen

    for (let i = 0; i < arpTable.length; i++) {

        const arpRow = arpTable[i];
        const mac = arpRow[1];
        const ip = arpRow[0];

        if (ip === destinationIP) {

            const macEncontrada = mac; //hemos encontrado la mac del equipo destino
            
            for (let i = 0; i < macs.length; i++) { //ahora buscamos la mac en la tabla del switch al que está conectado
                const mac = macs[i];
                if (mac === macEncontrada) { //si la encontramos, bingo, existe la conexión
                    console.log("1");
                    ping_s(originIP);
                    return `Haciendo ping a ${destinationIP} con 32 bytes de datos:\n\n`;
                }
            }

        }

    }

    for (let i = 0; i < macs.length; i++) { //si no está en la tabla ARP del equipo origen, mandamos al switch a mirar los equipos que están conectados al mismo

        const mac = macs[i];
        const pc = document.querySelector(`[data-mac="${mac}"]`);
        const ip = pc.getAttribute("data-ip");
        
        if (destinationIP === ip) { //bingo, hemos encontrado el equipo destino como uno de los equipos conectados al switch
            console.log("2");
            addARPEntry(originId, destinationIP, mac);
            ping_s(originIP);
            return `Haciendo ping a ${destinationIP} con 32 bytes de datos:\n\n`;
        }
    }
    
    console.log("3");
    ping_f(originIP); //si no hemos encontrado nada, damos el ping por fallido
    return `Haciendo ping a ${destinationIP} con 32 bytes de datos:\n\n`;
    
}

function ping_s(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML +=`64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 1000);

}

function ping_f(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML +=`From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 1000);

}
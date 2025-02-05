function ping( originIP, destinationIP ) {

    if (!originIP) {
        return "Error: IP no configurada.";
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
    
    //ahora toca mirar la tabla ARP del equipo origen

    const arpTable = getARPTable(originId);

    for (let i = 0; i < arpTable.length; i++) {
        const arpRow = arpTable[i];
        const mac = arpRow[1];
        const ip = arpRow[0];
        if (ip === destinationIP) {
            return `La IP ${ip} está en el MAC ${mac}`;
        }
    }

    //
    const NetworkOriginObject = document.getElementById(originId); //obtengo el elemento con ese id
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");    //de ese origen obtengo el switch al que está conectado
    const switchOriginObject = document.getElementById(switchIdentity);

    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");   //de ese switch obtengo la tabla de macs   
    let macs = [];
    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    for (let i = 0; i < macs.length; i++) {  //por cada mac obtengo el puntero del elemento, y del elemento obtengo la ip
        const mac = macs[i];
        const pc = document.querySelector(`[data-mac="${mac}"]`);
        const ip = pc.getAttribute("data-ip");
        
        if (destinationIP === ip) { //compruebo si la ip es igual a la de destino
            ping_s(originIP);
            return `Haciendo ping a ${destinationIP} con 32 bytes de datos:\n\n`;
        }
    }
    
    ping_f(originIP);
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
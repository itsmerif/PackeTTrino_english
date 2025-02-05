function ping( originIP, destinationIP ) {

    //compruebo que la ip de origen esta configurada
    if (!originIP) {
        return "IP no configurada.";
    }

    //obtengo el origen y compruebo que exista y no esté duplicado
    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const allOrigins = document.querySelectorAll(`[data-ip="${originIP}"]`);
    
    if (allOrigins.length > 1) { //si hay más de un origen con esa ip
        return "Error: Se encontró más de un elemento con la misma IP";
    }

    const originId = origin.id;  //obtengo el id del origen
    const NetworkOriginObject = document.getElementById(originId);

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
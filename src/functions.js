function getNetwork( ip, netmask) {
    ip = ip.split('.'); //separamos cada octeto de la ip
    netmask = netmask.split('.'); //separamos cada octeto de la netmask
    let network = [];
    for (let i = 0; i < 4; i++) {
        network[i] = ip[i] & netmask[i]; //aplicamos el AND entre cada octeto de la ip y la netmask
    }
    return network.join('.'); //juntamos los resultados 
}

function getRandomMac() {
    //genero los 48 bits aleatorios
    let macString = "";
    for (let i = 1; i <=48 ; i++) {
        macString += Math.floor(Math.random()*2);
    }
    //separamos los bloques de 8 bits
    let macBlocks = macString.match(/.{1,8}/g) || []; 
    //transformamos cada bloque en hexadecimal
    for (let i = 0; i < macBlocks.length; i++) {
        macBlocks[i] = (parseInt(macBlocks[i], 2).toString(16)).padStart(2, '0');
    }   
    //unimos los bloques en una cadena
    macBlocks = macBlocks.join(':');
    return macBlocks;
}

function ipconfig(id) {
    const pc = document.getElementById(id);
    const ip = pc.getAttribute("data-ip");
    const netmask = pc.getAttribute("data-netmask");
    const gateway = pc.getAttribute("data-gateway");
    const mac = pc.getAttribute("data-mac");
    return `
        Dirección IP: ${ip}
        Puerta de Enlace: ${gateway}
        Máscara de Red: ${netmask}
        Dirección Física: ${mac}
    `;
}

function ping(originIP, destinationIP) {

    let response =  "";

    //obtengo el id del origen
    const originId = document.querySelector(`[data-ip="${originIP}"]`).id;
    const NetworkOriginObject = document.getElementById(originId);

    //de ese origen obtengo el switch
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchIdentity);

    //de ese switch obtengo las macs
    const macElements = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");      
    let macs = [];
    for (let i = 0; i < macElements.length; i++) {
        macs.push(macElements[i].innerHTML);
    }

    //por cada mac obtengo el puntero del objeto, y del objeto obtengo la ip

    for (let i = 0; i < macs.length; i++) {
        const mac = macs[i];
        const pc = document.querySelector(`[data-mac="${mac}"]`);
        const ip = pc.getAttribute("data-ip");
        if (destinationIP === ip) {
            response = `64 bytes from ${originIP}: icmp_seq=1 ttl=64 time=0.030 m`;
        }
    }

    if (response === "") {
        response = `From ${originIP} icmp_seq=1 Destination Host Unreachable`;
    }

    return response;
}
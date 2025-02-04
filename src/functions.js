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
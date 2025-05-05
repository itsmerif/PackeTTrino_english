async function named_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const isRecursiveOn = $networkObject.getAttribute("recursion") === "true"; //<-- comprobamos si estamos activado el modo recursion
    const isCacheOn = $networkObject.getAttribute("resolved") === "true"; //<-- comprobamos si estamos activado el modo cache dns

    if (packet.destination_mac !== networkObjectMac || packet.destination_ip !== networkObjectIp) return;

    let newPacket = new dnsReply( // <--inicializamos el paquete sin respuesta
        networkObjectIp, // <--ip de origen
        packet.origin_ip, // <--ip de destino
        networkObjectMac, // <--mac de origen
        packet.origin_mac, // <--mac de destino
        packet.query, // <--nombre de dominio
        "" // <--respuesta
    ); 

    if (packet.answer_type === "SOA") {
        let [authority_domain, answer] = dns_SOA_Request_Proc(networkObjectId, packet);
        if (answer) newPacket.authority = "1";
        newPacket.answer_type = "SOA";
        newPacket.answer = answer;
        newPacket.authority_domain = authority_domain;
    }

    if (packet.answer_type === "A") {
        let answer = dns_A_Request_Proc(networkObjectId, packet); //<-- primero miramos en la base de datos dns
        if (!answer && isCacheOn) answer = isDomainInCacheDns(networkObjectId, packet.query)[1]; //<-- comprobamos si esta en la cache dns
        if (!answer && isRecursiveOn) answer = await recursiveDNSResolve(packet.query); // <-- hacemos una consulta recursiva si es necesario
        if (answer && isCacheOn) addDnsCacheEntry(networkObjectId, packet.query, packet.answer_type, answer, packet.origin_ip); // <-- añadimos la respuesta a la cache dns
        newPacket.answer_type = "A";
        newPacket.answer = answer;
    }

    return newPacket;

}

async function recursiveDNSResolve(domain) {

    try {

        const apiResponse = await fetch("https://dns.google.com/resolve?name=" + domain + "&type=A"); // <-- llamamos a la api de google
        const apiReply = await apiResponse.json(); // <-- decodificamos la respuesta json
        let resolution = apiReply.Answer.reduce( (acc, answer) => { if (isValidIp(answer.data)) acc.push(answer.data); return acc; }, []);        
        return resolution;

    } catch (error) {

        return false;

    }

}
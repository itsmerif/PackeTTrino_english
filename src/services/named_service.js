async function named_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const isNamedOn = $networkObject.getAttribute("named") === "true";
    const isRecursiveOn = $networkObject.getAttribute("recursion") === "true"; //<-- comprobamos si estamos activado el modo recursion
    const isCacheOn = $networkObject.getAttribute("resolved") === "true"; //<-- comprobamos si estamos activado el modo cache dns

    if (!isNamedOn) return;

    let newPacket = new dnsReply( // <--inicializamos el paquete sin respuesta
        networkObjectIp, // <--ip de origen
        packet.origin_ip, // <--ip de destino
        networkObjectMac, // <--mac de origen
        packet.origin_mac, // <--mac de destino
        packet.query, // <--nombre de dominio
        "" // <--respuesta
    );

    newPacket.dport = packet.sport;

    if (packet.answer_type === "A") {
        let answer = iterativeDnsQuery(networkObjectId, packet.query); //<-- consulta iterativa
        if (!answer && isCacheOn) answer = isDomainInCacheDns(networkObjectId, packet.query)[1]; //<-- consulta cache dns
        if (!answer && isRecursiveOn) answer = await recursiveDnsQuery(packet.query); // <-- consulta recursiva
        if (answer && isCacheOn) addDnsCacheEntry(networkObjectId, packet.query, packet.answer_type, answer, packet.origin_ip); // <-- añadimos la respuesta a la cache dns
        newPacket.answer = answer; //<-- se añade la respuesta
        newPacket.answer_type = "A"; //<-- se añade el tipo de registro
    }

    if (packet.answer_type === "PTR") {
        let answer = iterativeDnsQuery(networkObjectId, (packet.query).split(".").reverse().join(".") + ".IN-ADDR.ARPA."); //<-- consulta iterativa
        newPacket.answer = answer; //<-- se añade la respuesta
        newPacket.answer_type = "PTR"; //<-- se añade el tipo de registro
    }

    if (packet.answer_type === "SOA" || packet.answer_type === "NS") {
        let [authorityNameServer, authorityDomain] = getSoaRecord(networkObjectId, packet.query);
        if (authorityNameServer) newPacket.authority = "1";
        newPacket.answer_type = "SOA";
        newPacket.answer = authorityNameServer;
        newPacket.authority_domain = authorityDomain;
    }

    return newPacket;

}

async function recursiveDnsQuery(domain) {

    try {

        const apiResponse = await fetch("https://dns.google.com/resolve?name=" + domain + "&type=A"); // <-- llamamos a la api de google
        const apiReply = await apiResponse.json(); // <-- decodificamos la respuesta json
        let resolution = apiReply.Answer.reduce( (acc, answer) => { if (isValidIp(answer.data)) acc.push(answer.data); return acc; }, []);        
        return resolution;

    } catch (error) {

        return false;

    }

}
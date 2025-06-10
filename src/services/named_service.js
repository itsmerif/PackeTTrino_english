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

        //consulta iterativa

        let answer = iterativeDnsQuery(networkObjectId, packet.query); 

        //consulta de la cache dns

        if (!answer && isCacheOn) answer = isDomainInCacheDns(networkObjectId, packet.query)[1];

        //consulta recursiva

        if (!answer && isRecursiveOn) {
            answer = await recursiveDnsQuery(packet.query);
            if (answer && isCacheOn) addDnsCacheEntryServer(networkObjectId, packet.query, packet.answer_type, answer[0]);
        }
        
        //obtenemos el TTL del registro en caché
        
        if (answer) {
            const soaData = getSoaRecord(networkObjectId, packet.query);
            newPacket.cache_ttl = soaData["cacheTTL"];
        }

        //añadimos los valores de la respuesta

        if (typeof answer === 'string') newPacket.answer = [answer];
        else newPacket.answer = answer;

        //se añade el tipo de registro
        
        newPacket.answer_type = "A"; 
    }

    if (packet.answer_type === "PTR") {
        let answer = iterativeDnsQuery(networkObjectId, (packet.query).split(".").reverse().join(".") + ".IN-ADDR.ARPA."); //<-- consulta iterativa
        newPacket.answer = answer; //<-- se añade la respuesta
        newPacket.answer_type = "PTR"; //<-- se añade el tipo de registro
    }

    if (packet.answer_type === "SOA" || packet.answer_type === "NS") {

        const soaData = getSoaRecord(networkObjectId, packet.query);

        if (soaData["authorityNameServer"]) newPacket.authority = "1";

        newPacket.answer_type = "SOA";
        newPacket.answer = soaData["authorityNameServer"];
        newPacket.authority_domain = soaData["authorityDomain"];
        newPacket.serial = soaData["serial"];
        newPacket.cache_ttl = soaData["cacheTTL"];

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
async function domainNameResolution(networkObjectId, domain) {

    const $networkObject = document.getElementById(networkObjectId);
    const useCache = $networkObject.getAttribute("resolved") === "true";
    let response = false; //<-- inicializamos la respuesta a falso

    //comprobamos si el dominio esta en el archivo /etc/hosts

    response = getDomainFromEtcHosts(networkObjectId, domain);

    //comprobamos si el dominio esta en la cache dns (si la cache esta activa)

    if (!response && useCache) response = isDomainInCacheDns(networkObjectId, domain)[1];

    //intentamos resolver el dominio desde el servidor dns

    if (!response) {

        try {

            await getDomainFromServer(
                networkObjectId, //id del objeto
                domain, //dominio
                false, //verbose
                "", //ip del servidor (por defecto la del equipo)
                "A", //tipo de registro
                false, //eliminar despues de usar
                true //intentar generar cache
            );

            let dnsReply = buffer[networkObjectId];
            delete buffer[networkObjectId];
            response = dnsReply.answer[0]; //se devuelve el primer valor

        } catch (error) {

            console.log(error);
            response = false; //<-- falso si no se pudo resolver

        }

    }

    return response;

}

async function getDomainFromServer(networkObjectId, domain, verbose, dnsServer = "", query_type, deleteAfterUse, genCache) {

    const $networkObject = document.getElementById(networkObjectId);
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true"; //comprobamos si el equipo tiene una cache dns

    if (!isValidIp(domain) && !domain.endsWith(".")) domain = domain + ".";

    //reseteamos el flag de comunicaciones
    
    dnsRequestFlag[networkObjectId] = false; 

    //si no se especifico un servidor dns se usan los del equipo
    
    const networkObjectDnsServers = getDnsServers(networkObjectId);
    const serversToTry = (dnsServer === "") ? networkObjectDnsServers : [dnsServer]; 
    if (serversToTry.length === 0) throw new Error("Error: No hay servidores DNS configurados.");
    
    //intentamos resolver el dominio con cada uno de los servidores dns

    let answered = false;
    let i = 0;

    while (i < serversToTry.length && !answered) {
        
        const dnsServer = serversToTry[i];

        if (isLocalIp(networkObjectId, dnsServer)) { //servidores DNS locales

            const newDnsRequest = new dnsRequest(
                $networkObject.getAttribute(`ip-${getInterfaces(networkObjectId)[0]}`),
                dnsServer,
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`),
                $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`),
                domain
            );

            newDnsRequest.answer_type = query_type;

            const dnsReply = await named_service(networkObjectId, newDnsRequest);
        
            if (dnsReply) {
                answered = true;
                buffer[networkObjectId] = dnsReply;
            }

        } else { //servidores DNS remotos

            await dnsRequestPacketGenerator(networkObjectId, domain, dnsServer, query_type); 
            if (dnsRequestFlag[networkObjectId] === true) answered = true;

        }

        i++;
    }

    //si no se pudo resolver el dominio se lanza una excepcion

    if (!answered) {
        if (verbose) terminalMessage(`communications error to ${serversToTry[i-1]}#53: timed out`, networkObjectId);
        throw new Error("Error: No se pudo resolver el nombre de dominio.");
    }

    const dnsReplyPacket = buffer[networkObjectId]; 

    //en modo verboso se genera este mensaje en la consola    
    if (verbose) generateDnsOuput(dnsReplyPacket, networkObjectId);

    //se lanza una excepcion si no hay respuesta
    if (!dnsReplyPacket.answer) throw new Error("Error: No se pudo resolver el nombre de dominio.");

    //añadimos la respuesta a la cache dns
    if (isResolvedOn && genCache) addDnsCacheEntry(networkObjectId, dnsReplyPacket);
    
    //elimiamos el paquete del buffer si no se va a usar
    if (deleteAfterUse) delete buffer[networkObjectId];

}

async function dnsRequestPacketGenerator(networkObjectId, domain, dnsServer, query_type) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    if (!dnsServer) return;
    let packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, "", domain);
    packet.answer_type = query_type;
    await routing(networkObjectId, packet, true);
}
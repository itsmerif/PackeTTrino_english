async function domainNameResolution(networkObjectId, domain) {

    const $networkObject = document.getElementById(networkObjectId);
    const useCache = $networkObject.getAttribute("resolved") === "true";
    let response = false; //<-- inicializamos la respuesta a falso

    response = getDomainFromEtcHosts(networkObjectId, domain); //<--comprobamos si el dominio esta en el archivo /etc/hosts

    if (!response && useCache) response = isDomainInCacheDns(networkObjectId, domain)[1]; //<--comprobamos si el dominio esta en la cache dns (si la cache esta activa)

    if (!response) { //<-- intentamos resolver el dominio desde el servidor dns

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
            response = dnsReply.answer; //<-- respuesta obtenida

        } catch (error) {
            
            response = false; //<-- falso si no se pudo resolver
            
        }

    }

    return response;
    
}

async function getDomainFromServer(networkObjectId, domain, verbose, dnsServer = "", query_type, deleteAfterUse, genCache) {

    const $networkObject = document.getElementById(networkObjectId);
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true"; //<-- comprobamos si el equipo tiene una cache dns

    if (!isValidIp(domain) && !domain.endsWith(".")) domain = domain + "."; //<-- si se trata de un dominio, nos aseguramos de que este termine en punto (FQDN)

    dnsRequestFlag[networkObjectId] = false; // <-- reseteamos el flag de comunicaciones

    dnsServer = (dnsServer === "") ? $networkObject.getAttribute("data-dns-server") : dnsServer; // <-- si no se especifica un servidor dns se usa el del equipo

    await dnsRequestPacketGenerator(networkObjectId, domain, dnsServer, query_type); //<-- realizamos la solicitud dns

    if (dnsRequestFlag[networkObjectId] === false) { //<-- comprobamos si se ha obtenido una respuesta
        if (verbose) terminalMessage(`communications error to ${dnsServer}#53: timed out`, networkObjectId); //<-- en modo verboso se muestra este mensaje en la consola
        throw new Error("Error: No se pudo resolver el nombre de dominio."); //<-- en modo no verboso se lanza una excepcion
    }

    let dnsReply = buffer[networkObjectId]; //<-- recuperamos el paquete de respuesta

    if (verbose) generateDnsOuput(dnsReply, networkObjectId); //<-- en modo verboso se genera este mensaje en la consola

    if (!dnsReply.answer) throw new Error("Error: No se pudo resolver el nombre de dominio."); //se lanza una excepcion si no hay respuesta

    if (isResolvedOn && genCache) addDnsCacheEntry(networkObjectId, dnsReply.query, dnsReply.answer_type, dnsReply.answer, dnsReply.origin_ip);

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
    await hostRouting(networkObjectId, packet);
}
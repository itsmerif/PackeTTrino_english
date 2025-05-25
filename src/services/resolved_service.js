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

    if (!isValidIp(domain) && !domain.endsWith(".")) domain = domain + ".";

    dnsRequestFlag[networkObjectId] = false; // <-- reseteamos el flag de comunicaciones

    dnsServer = (dnsServer === "") ? getDnsServers(networkObjectId)[0] : dnsServer; // <-- si no se especifica un servidor dns se usa el del equipo

    if (!dnsServer) throw new Error("Error: No hay servidores DNS configurados.");

    if (isLocalIp(networkObjectId, dnsServer)) { //si el servidor es local, se llama directamente al servicio named en el dispositivo

        const newDnsRequest = new dnsRequest(
            $networkObject.getAttribute(`ip-${getInterfaces(networkObjectId)[0]}`),
            dnsServer,
            $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`),
            $networkObject.getAttribute(`mac-${getInterfaces(networkObjectId)[0]}`),
            domain
        );

        newDnsRequest.answer_type = query_type;
        
        buffer[networkObjectId] = await named_service(networkObjectId, newDnsRequest);

    } else {

        await dnsRequestPacketGenerator(networkObjectId, domain, dnsServer, query_type); //<-- realizamos la solicitud dns al servidor remoto

        if (dnsRequestFlag[networkObjectId] === false) { //<-- comprobamos si se ha obtenido una respuesta
            if (verbose) terminalMessage(`communications error to ${dnsServer}#53: timed out`, networkObjectId); //<-- en modo verboso se muestra este mensaje en la consola
            throw new Error("Error: No se pudo resolver el nombre de dominio."); //<-- en modo no verboso se lanza una excepcion
        }

    }

    const dnsReplyPacket = buffer[networkObjectId]; //<-- recuperamos el paquete de respuesta

    console.log(dnsReplyPacket);

    if (verbose) generateDnsOuput(dnsReplyPacket, networkObjectId); //<-- en modo verboso se genera este mensaje en la consola

    if (!dnsReplyPacket.answer) throw new Error("Error: No se pudo resolver el nombre de dominio."); //se lanza una excepcion si no hay respuesta

    if (isResolvedOn && genCache) addDnsCacheEntry(networkObjectId, dnsReplyPacket.query, dnsReplyPacket.answer_type, dnsReplyPacket.answer, dnsReplyPacket.origin_ip);

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
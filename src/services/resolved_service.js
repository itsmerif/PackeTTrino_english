async function domainNameResolution(networkObjectId, domain) {

    const $networkObject = document.getElementById(networkObjectId);
    const useCache = $networkObject.getAttribute("resolved") === "true";
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true";
    let response = false;

    //comprobamos si el dominio esta en el archivo /etc/hosts

    response = getDomainFromEtcHosts(networkObjectId, domain);

    //comprobamos si el dominio esta en la cache dns (si la cache esta activa)

    if (!response && useCache) response = isDomainInCacheDns(networkObjectId, domain)[1];

    //intentamos resolver el dominio desde el servidor dns

    if (!response) {

        try {

            const dnsReply = await getDomainFromServer(
                networkObjectId, //id del objeto
                domain, //dominio
                "", //ip del servidor (por defecto la del equipo)
                "A", //tipo de registro
            );

            if (!dnsReply.answer) throw new Error("Error: The domain name could not be resolved.");
            if (isResolvedOn) addDnsCacheEntry(networkObjectId, dnsReply);

            response = dnsReply.answer[0]; //se devuelve el primer valor

        } catch (error) {

            console.log(error);
            response = false;

        }

    }

    return response;

}

async function getDomainFromServer(networkObjectId, domain, dnsServer = "", query_type) {

    const $networkObject = document.getElementById(networkObjectId);
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true"; //comprobamos si el equipo tiene una cache dns

    if (!isValidIp(domain) && !domain.endsWith(".")) domain = domain + ".";

    //reseteamos el flag de comunicaciones

    dnsRequestFlag[networkObjectId] = false;

    //si no se especifico un servidor dns se usan los del equipo

    const networkObjectDnsServers = getDnsServers(networkObjectId);
    const serversToTry = (dnsServer === "") ? networkObjectDnsServers : [dnsServer];
    if (serversToTry.length === 0) throw new Error("Error: No DNS servers are configured.");

    //intentamos resolver el dominio con cada uno de los servidores dns

    let answered = false; //booleano que indica si se ha recibido una respuesta de alguno de los servidores dns
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

    if (!answered) throw new Error(`Communication error with ${serversToTry[i-1]}#53: timeout`);

    //devolvemos el paquete de respuesta (en el buffer de paquetes del dispositivo)
    return buffer[networkObjectId];

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

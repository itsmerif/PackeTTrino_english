async function dig(networkObjectId, domain, query_type, dnsServer) {

    try {

        await getDomainFromServer(
            networkObjectId, //id del objeto
            domain, //dominio
            true, // verbose
            dnsServer, //ip del servidor
            query_type, //tipo de registro
            true, //eliminar despues de usar
            false //no generar cache
        );

    } catch (error) {

        console.log(error.message);
        
    }

}

async function domainNameResolution(networkObjectId, domain) {

    const $networkObject = document.getElementById(networkObjectId);
    const useCache = $networkObject.getAttribute("resolved") === "true";

    let response = false;

    response = isDomainInEtcHosts(networkObjectId, domain);

    if (!response && useCache) response = isDomainInCachePc(networkObjectId, domain)[1];

    if (!response) {

        try {

            await getDomainFromServer(
                networkObjectId, //id del objeto
                domain, //dominio
                false, //verbose
                "", //ip del servidor
                "A", //tipo de registro
                false //eliminar despues de usar
            );

            let dnsReply = buffer[networkObjectId];
            delete buffer[networkObjectId];

            response = dnsReply.answer;

        } catch (error) {
            
            response = false;
            
        }

    }

    return response;
    
}

async function getDomainFromServer(networkObjectId, domain, verbose = false, dnsServer = "", query_type = "A", deleteAfterUse, genCache = true) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true";

    if (!domain.endsWith(".")) domain = domain + ".";

    dnsRequestFlag[networkObjectId] = false;

    await dnsRequestPacketGenerator(networkObjectId, switchId, domain, dnsServer, query_type);

    if (dnsRequestFlag[networkObjectId] === false) {
        if (verbose) terminalMessage(`communications error to ${dnsServer}#53: timed out`, networkObjectId);
        throw new Error("Error: No se pudo resolver el nombre de dominio.");
    }

    let dnsReply = buffer[networkObjectId];

    if (verbose) generateDnsOuput(dnsReply, networkObjectId);

    if (!dnsReply.answer) throw new Error("Error: No se pudo resolver el nombre de dominio.");

    if (isResolvedOn && genCache) addDnsCacheEntry(networkObjectId, dnsReply.query, dnsReply.answer_type, dnsReply.answer, dnsReply.origin_ip);

    if (deleteAfterUse) delete buffer[networkObjectId];

}

async function dnsRequestPacketGenerator(networkObjectId, switchId, domain, dnsServer = "", query_type = "A") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    dnsServer = (dnsServer === "") ? $networkObject.getAttribute("data-dns-server") : dnsServer;
    if (!dnsServer) throw new Error("Error: No se ha definido el servidor DNS");

    let packet = new dnsRequest(networkObjectIp, dnsServer, networkObjectMac, "", domain);
    packet.answer_type = query_type;
    const isSameNetwork = getNetwork(networkObjectIp, networkObjectNetmask) === getNetwork(dnsServer, networkObjectNetmask);

    if (!isSameNetwork) {

        const defaultGateway = $networkObject.getAttribute("data-gateway");

        if (!defaultGateway) throw new Error("Error: Puerta de Enlace Predeterminada No Configurada");
        
        const defaultGatewayMac = isIpInARPTable(networkObjectId, defaultGateway);

        if (!defaultGatewayMac) { 
            buffer[networkObjectId] = packet;
            await arpResolve(networkObjectId, defaultGateway);
            return;
        }

        packet.destination_mac = defaultGatewayMac;
        addPacketTraffic(packet);
        await switchProcessor(switchId, networkObjectId, packet);
        return;

    }

    const destination_mac = isIpInARPTable(networkObjectId, dnsServer);

    if (!destination_mac) {
        buffer[networkObjectId] = packet;
        await arpResolve(networkObjectId, dnsServer);
        return;
    }

    packet.destination_mac = destination_mac;
    addPacketTraffic(packet);
    await switchProcessor(switchId, networkObjectId, packet);

}
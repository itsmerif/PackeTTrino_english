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

            console.log(error);

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

function generateDnsOuput(packet, networkObjectId) {

    //campos del paquete

    let query = packet.query;
    let answer = packet.answer || "";
    let answer_type = packet.answer_type;
    let authority = packet.authority || "0"; //solo para SOA
    let authority_domain = packet.authority_domain || ""; //solo para SOA
    let server_ip = packet.origin_ip;
    let answerBoolean = (!answer || (authority === "1" && query !== authority_domain)) ? "0" : "1";

    //fecha actual

    const currentDate = new Date();
    const currentDateString = currentDate.toString();

    //header

    terminalMessage(`<p>QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 0</p>`, networkObjectId);
    terminalMessage("<p></p>", networkObjectId);

    //seccion de query

    terminalMessage(`<p>QUESTION SECTION: </p>`, networkObjectId);
    terminalMessage(`<p>${query.padEnd(15, " ")}` + " IN " + `${answer_type} </p>`, networkObjectId);
    terminalMessage("<p></p>", networkObjectId);

    //seccion de respuesta

    if (answer) {
        terminalMessage(`ANSWER SECTION:`, networkObjectId);
        if (typeof answer === 'string') {
            terminalMessage(`<p>${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer}</p>`, networkObjectId);
        } else {
            for (let i = 0; i < answer.length; i++) {
                terminalMessage(`<p>${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer[i]}</p>`, networkObjectId);
            }
        }
        terminalMessage("<p></p>", networkObjectId);
    }

    //seccion de autoridad

    if (authority !== "0") {
        terminalMessage(`AUTHORITY SECTION:`, networkObjectId);
        terminalMessage(`<p>${authority_domain.padEnd(15, " ")}` + " 86400 IN " + `${answer_type}` + " " + `${authority} </p>`, networkObjectId);
        terminalMessage("<p></p>", networkObjectId);
    }

    //seccion de tiempo
    terminalMessage("<p>Query time: 4 msec<p>", networkObjectId);
    terminalMessage(`<p>SERVER: ${server_ip}#53(${server_ip}) (UDP)</p>`, networkObjectId);
    terminalMessage("<p>WHEN: " + currentDateString + "</p>", networkObjectId);
    terminalMessage("<p>MSG SIZE  rcvd: 87</p>", networkObjectId);
}

function isDomainInCachePc(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let FQDN_targetDomain = targetDomain;

    if (!targetDomain.endsWith(".")) FQDN_targetDomain = FQDN_targetDomain + ".";

    let i = 1;

    while (i < records.length) {

        let row = records[i];
        let server = row.getAttribute("data-server");
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;

        if (domain === FQDN_targetDomain) {

            if (type === "A" || type === "PTR") return [type, value, server];

            if (type === "CNAME") {
                let [translationType, translation] = isDomainInCachePc(networkObjectId, value);
                return [translationType, translation, server];
            }

        }

        i++;

    }

    return [false, false, false];

}

function addDnsCacheEntry(networkObjectId, query, answer_type, answer, server) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const newRow = document.createElement("tr");
    if (!query.endsWith(".")) query = query + "."; //los nombres se guardan como FQDN

    if (typeof answer !== 'string') {
        let i = 0;
        while (i < answer.length && !isValidIp(answer[i])) {
            i++;
        }
        answer = answer[i];
    }

    newRow.innerHTML = `
        <tr>
            <td>${query}</td>
            <td>${answer_type}</td>
            <td>${answer}</td>
        </tr>`;
    newRow.setAttribute("data-server", server);
    dnsTable.appendChild(newRow);

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

async function command_dig(dataId, args) {

    let opt_x = false;
    let opt_t = false;
    let opt_server = false;
    let domain;
    let dnsServer = "";
    let query_type = "A";
    const validTypes = ["A", "SOA", "PTR", "NS", "AAAA", "MX"];

    let $OPTS = catchopts(["-x", "-t:", "@:"], args);

    for (option in $OPTS) {
        switch (option) {
            case "-x":
                opt_x = true;
                query_type = "PTR";
                break;
            case "-t":
                opt_t = true;
                query_type = $OPTS["-t"];
                break;
            case "@":
                opt_server = true;
                dnsServer = $OPTS["@"];
                break;
        }
    }

    args = args.slice($OPTS['IND'] + 1)

    if (args.length === 0) {
        terminalMessage("Error: falta el argumento dominio o ip.");
        return;
    }

    domain = args[0];

    if (opt_t && !validTypes.includes(query_type)) {
        terminalMessage("Error: tipo de registro desconocido.")
        return;
    }

    if (!opt_x && !isValidDomain(domain)) {
        terminalMessage("Error: el dominio no es válido.");
        return;
    }

    if (opt_x && !isValidIp(domain)) {
        terminalMessage("Error: ip no válida para la consulta inversa.");
        return;
    }

    if (opt_server && !isValidIp(dnsServer)) {
        terminalMessage("Error: ip del servidor no válida.");
        return;
    }

    if (visualToggle) await minimizeTerminal();

    try {
        cleanPacketTraffic();
        await getDomainFromServer(dataId, domain, true, dnsServer, query_type)
    } catch (error) {
        console.log(error);
    }

    if (visualToggle) await maximizeTerminal();
}

async function domainNameResolution(dataId, domain) {

    const $networkObject = document.getElementById(dataId);
    const useCache = $networkObject.getAttribute("resolved") === "true";

    let response = false;

    response = isDomainInEtcHosts(dataId, domain);

    if (!response && useCache) response = isDomainInCachePc(dataId, domain)[1];

    if (!response) {

        try {

            await getDomainFromServer(dataId, domain, false, "", true, "A");
            let dnsReply = buffer[dataId];
            response = dnsReply.answer;
            delete buffer[dataId];

        } catch (error) {

            console.log(error);

        }

    }

    return response;
}

async function getDomainFromServer(dataId, domain, verbose = false, dnsServer = "", query_type = "A") {

    const $networkObject = document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    const isResolvedOn = $networkObject.getAttribute("resolved") === "true";

    if (!domain.endsWith(".")) domain = domain + ".";

    dnsRequestFlag = false;

    await dnsRequestPacketGenerator(dataId, switchId, domain, dnsServer, query_type);

    if (!dnsRequestFlag) {
        if (verbose) terminalMessage("Error: No se pudo resolver el nombre de dominio.");
        throw new Error("Error: No se pudo resolver el nombre de dominio.");
    }

    let dnsReply = buffer[dataId];

    if (verbose) generateDnsOuput(dnsReply);

    if (!dnsReply.answer) throw new Error("Error: No se pudo resolver el nombre de dominio.");

    if (isResolvedOn) addDnsCacheEntry(dataId, dnsReply.query, dnsReply.answer_type, dnsReply.answer, dnsReply.origin_ip);

}

function isDomainInEtcHosts(dataId, domain) {
    const $networkObject = document.getElementById(dataId);
    const etcHostFile = $networkObject.getAttribute("data-etc-hosts");
    let etcHostsEntries = JSON.parse(etcHostFile);
    for (let ip in etcHostsEntries) {
        if (etcHostsEntries[ip].includes(domain)) {
            return ip;
        }
    }
    return false;
}

function isDomainInCachePc(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
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

    console.log("baliza");
    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
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

function generateDnsOuput(packet) {

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

    terminalMessage(`<p>QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 0</p>`);
    terminalMessage("<p></p>");

    //seccion de query

    terminalMessage(`<p>QUESTION SECTION: </p>`);
    terminalMessage(`<p>${query.padEnd(15, " ")}` + " IN " + `${answer_type} </p>`);
    terminalMessage("<p></p>");

    //seccion de respuesta

    if (answer) {
        terminalMessage(`ANSWER SECTION:`);
        if (typeof answer === 'string') {
            terminalMessage(`<p>${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer}</p>`);
        } else {
            for (let i = 0; i < answer.length; i++) {
                terminalMessage(`<p>${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer[i]}</p>`);
            }
        }
        terminalMessage("<p></p>");
    }

    //seccion de autoridad

    if (authority !== "0") {
        terminalMessage(`AUTHORITY SECTION:`);
        terminalMessage(`<p>${authority_domain.padEnd(15, " ")}` + " 86400 IN " + `${answer_type}` + " " + `${authority} </p>`);
        terminalMessage("<p></p>");
    }

    //seccion de tiempo
    terminalMessage("<p>Query time: 4 msec<p>");
    terminalMessage(`<p>SERVER: ${server_ip}#53(${server_ip}) (UDP)</p>`);
    terminalMessage("<p>WHEN: " + currentDateString + "</p>");
    terminalMessage("<p>MSG SIZE  rcvd: 87</p>");
}

function isDomainInCache(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let FQDN_targetDomain = targetDomain;

    if (!isValidIp(targetDomain) && !targetDomain.endsWith(".")) FQDN_targetDomain = FQDN_targetDomain + ".";

    let i = 1;

    while (i < records.length) {

        let row = records[i];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;

        if (domain === FQDN_targetDomain) {
            return [type, value];
        }

        i++;

    }

    return [false, false];

}
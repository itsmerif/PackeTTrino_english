async function command_dig(dataId, args) {
    let opt_x = false;
    let opt_t = false;
    let opt_server = false;
    let domain;
    let dnsServer = "";
    let useCache = false; //como estamos usando dig directamente, no usamos la cache local
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
                useCache = false;
                break;
        }
    }

    args = args.slice($OPTS['IND'] + 1) //nos quedamos con el resto de argumentos sin contar opciones

    if (args.length === 0) {
        terminalMessage("Error: falta el argumento dominio o ip.");
        return;
    }

    domain = args[0]; //el primer argumento es el dominio

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
        await dig(dataId, domain, true, dnsServer, useCache, query_type)
    } catch (error) {
        console.log(error);
    }

    if (visualToggle) await maximizeTerminal();
}

async function dig(dataId, domain, verbose = false, dnsServer = "", useCache = true, query_type = "A") {

    cleanPacketTraffic();

    const $networkObject = document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    if (!domain.endsWith(".")) domain = domain + "."; //si no es un FQDN, lo agregamos
    let [answer_type, answer, server_ip] = [false, false, false];

    if (useCache) [answer_type, answer, server_ip] = isDomainInCachePc(dataId, domain); //buscamos en la tabla de cache del equipo

    if (!answer) { //no tenemos la ip en cache, buscamos en el servidor

        dnsRequestFlag = false;
        await dnsRequestPacketGenerator(dataId, switchId, domain, dnsServer, query_type);

        if (!dnsRequestFlag) {
            if (verbose) terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            throw new Error("Error: No se pudo resolver el nombre de dominio.");
        } else {
            let packet = buffer[dataId];
            if (!packet.answer) throw new Error("Error: No se pudo resolver el nombre de dominio.");
            if (verbose) generateDnsOuput(packet);
            if (useCache) addDnsCacheEntry(dataId, query, answer_type, answer, server_ip);
        }

        return;
    }

    dnsRequestFlag = true;
    if (verbose) generateDnsOuput(domain, answer_type, answer, "0", server_ip);

}

async function domainNameResolution(dataId, domain) {

    let response;

    //primero miramos en el /etc/hosts

    response = isDomainInEtcHosts(dataId, domain);
    if (response) return response;

    //no se encuentra en el /etc/hosts, buscamos en la cache, y si no, en el servidor

    try {
        await dig(dataId, domain, false);
        return isDomainInCachePc(dataId, domain)[1];
    } catch (error) {
        console.log(error);
        return false;
    }

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

    if (!targetDomain.endsWith(".")) {  //añadimos el punto al final para que sea un FQDN
        FQDN_targetDomain = FQDN_targetDomain + ".";
    }

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

function addDnsCacheEntry(networkObjectId, domain, type, value, server) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const newRow = document.createElement("tr");
    if (!domain.endsWith(".")) domain = domain + "."; //los nombres se guardan como FQDN

    newRow.innerHTML = `
        <tr>
            <td>${domain}</td>
            <td>${type}</td>
            <td>${value}</td>
        </tr>`;
    newRow.setAttribute("data-server", server);
    dnsTable.appendChild(newRow);

}

function generateDnsOuput(packet) {

    const currentDate = new Date();
    const currentDateString = currentDate.toString();

    //campos del paquete
    let query = packet.query;
    let answer = packet.answer || "";
    let answer_type = packet.answer_type;
    let authority = packet.authority || "0"; //solo para SOA
    let authority_domain = packet.authority_domain || ""; //solo para SOA
    let server_ip = packet.origin_ip;

    //formateo de la salida
    let answerBoolean = ( !answer || (authority === "1" && query !== authority_domain) ) ? "0" : "1";
    let answerSectionDomain = (authority !== "0") ? authority_domain : query;

    terminalMessage(`<p>QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 0</p>`);
    terminalMessage(`<p>QUESTION SECTION: </p>`);
    terminalMessage(`<p>${query.padEnd(15, " ")}` + " IN " + `${answer_type} </p>`);
    terminalMessage(`ANSWER SECTION:`);
    terminalMessage(`<p style="color: #86ff33;" >${answerSectionDomain.padEnd(15, " ")}` + " 86400 IN " + `${answer_type}` + " " + `${answer} </p>`);
    terminalMessage("<p>Query time: 4 msec<p>");
    terminalMessage(`<p>SERVER: ${server_ip}#53(${server_ip}) (UDP)</p>`);
    terminalMessage("<p>WHEN: " + currentDateString + "</p>");
    terminalMessage("<p>MSG SIZE  rcvd: 87</p>");
}

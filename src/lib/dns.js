class dnsRecord {
    constructor(domain, type, value) {
        this.domain = domain;
        this.type = type;
        this.value = value;
    }
}

function isDomainInEtcHosts(dataId, domain) {
    const $networkObject = document.getElementById(dataId);
    const etcHostFile = $networkObject.getAttribute("data-etc-hosts");
    let etcHostsEntries = JSON.parse(etcHostFile);

    for (let ip in etcHostsEntries) {
        if (etcHostsEntries[ip].includes(domain))  return ip;
    }
    
    return false;
}

function isSOA(dataId, targetDomain) {

    const $networkObject = document.getElementById(dataId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");

    let i = 1;

    while (i < records.length) {

        let row = records[i];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;

        if (domain === targetDomain && type === "SOA") {
            return true;
        }

        i++;

    }

    return false;

}

function addDnsEntry(serverObjectId, newrecord) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table")
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <tr>
            <td>${newrecord.domain}</td>
            <td>${(newrecord.type).toUpperCase()}</td>
            <td>${newrecord.value}</td>
        </tr>`;
    dnsTable.appendChild(newRow);

}

function delDnsEntry(dataId, targetDomain) {
    const $serverObject = document.getElementById(dataId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $records = $dnsTable.querySelectorAll("tr");
    let i = 1;
    let found = false;

    while ( i < $records.length && !found ) {

        let $record = $records[i];

        let $fields = $record.querySelectorAll("td");

        let domain = $fields[0].innerHTML;

        if (domain === targetDomain) {
            $record.remove();
            found = true;
        }

        i++;
    }

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

function dns_SOA(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t SOA &lt;domain&gt; &lt;ns&gt; </p>", dataId);
        return;
    }

    if (!isValidDomain(args[4])) {
        terminalMessage("Error: Dominio Invalido", dataId);
        return;
    }

    if (!args[4].endsWith(".")) {
        terminalMessage("Error: Dominio Debe Ser UN FQDN", dataId);
        return;
    }

    if (!isValidDomain(args[5])) {
        terminalMessage("Error: Autoridad Invalida", dataId);
        return;
    }

    if (!args[5].endsWith(".")) {
        terminalMessage("Error: Autoridad Debe Ser UN FQDN", dataId);
        return;
    }

    if (isSOA(dataId, args[4])) {
        terminalMessage("Error: Ya existe un registro de SOA para este dominio.", dataId);
        return;
    }

    let record = new dnsRecord(args[4], "SOA", args[5]);
    addDnsEntry(dataId, record);

}

function dns_NS(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t NS &lt;domain&gt; &lt;authority&gt; </p>", dataId);
        return;
    }

    if (!isValidDomain(args[4])) {
        terminalMessage("Error: Dominio Invalido", dataId);
        return;
    }

    if (!args[4].endsWith(".")) {
        terminalMessage("Error: Dominio Debe Ser UN FQDN", dataId);
        return;
    }

    if (!isValidDomain(args[5])) {
        terminalMessage("Error: Autoridad Invalida", dataId);
        return;
    }

    if (!args[5].endsWith(".")) {
        terminalMessage("Error: Autoridad Debe Ser UN FQDN", dataId);
        return;
    }

    let record = new dnsRecord(args[4], "NS", args[5]);
    addDnsEntry(dataId, record);

}

function dns_A(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t A &lt;domain&gt; &lt;ip&gt; </p>", dataId);
        return;
    }

    if (!isValidDomain(args[4])) {
        terminalMessage("Error: Dominio Invalido", dataId);
        return;
    }

    if (!args[4].endsWith(".")) {
        terminalMessage("Error: Dominio Debe Ser UN FQDN", dataId);
        return;
    }
    
    if (!isValidIp(args[5])) {
        terminalMessage("Error: IP Invalida", dataId);
        return;
    }

    let record = new dnsRecord(args[4], "A", args[5]);
    addDnsEntry(dataId, record);
}

function dns_CNAME(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t CNAME &lt;domain&gt; &lt;alias&gt; </p>", dataId);
        return;
    }

    let record = new dnsRecord(args[4], "CNAME", args[5]);
    addDnsEntry(dataId, record);

}

function dns_SOA_Request_Proc(serverObjectId, packet) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let recordIndex;
    let query = packet.query;
    let targetDomain;
    let response = [false, false];

    if (!query.endsWith(".")) query = query + "."; 
    query = query.split(".");

    for (let i = 0; i < query.length; i++) {
        targetDomain = query.slice(i).join(".");
        recordIndex = 1;
        while (recordIndex < records.length && !response[0]) {
            let row = records[recordIndex];
            let cells = row.querySelectorAll("td");
            let domain = cells[0].innerHTML;
            let type = cells[1].innerHTML;
            let value = cells[2].innerHTML;
            if (targetDomain === domain && type === "SOA") response = [targetDomain, value];
            recordIndex++;
        }
    }

    return response;
}

function dns_A_Request_Proc(serverObjectId, packet) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let response = false;
    let recordIndex;
    let query = packet.query;

    if (!query.endsWith(".")) query = query + ".";

    recordIndex = 1;

    while (recordIndex < records.length && !response) {
        let row = records[recordIndex];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;
        if (domain === query && type === "CNAME") query = value;
        if (domain === query && type === "A") response = value;
        recordIndex++;
    }

    return response;

}
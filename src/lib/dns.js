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

function dns_SOA(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t SOA &lt;domain&gt; &lt;ns&gt; </p>");
        return;
    }

    if (!isValidDomain(args[4])) {
        terminalMessage("Error: Dominio Invalido");
        return;
    }

    if (!args[4].endsWith(".")) {
        terminalMessage("Error: Dominio Debe Ser UN FQDN");
        return;
    }

    if (!isValidDomain(args[5])) {
        terminalMessage("Error: Autoridad Invalida");
        return;
    }

    if (!args[5].endsWith(".")) {
        terminalMessage("Error: Autoridad Debe Ser UN FQDN");
        return;
    }

    if (isSOA(dataId, args[4])) {
        terminalMessage("Error: Ya existe un registro de SOA para este dominio.");
        return;
    }

    let record = new dnsRecord(args[4], "SOA", args[5]);
    addDnsEntry(dataId, record);
    terminalMessage("Registro SOA agregado correctamente para el dominio " + args[4]);

}

function dns_NS(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t NS &lt;domain&gt; &lt;authority&gt; </p>");
        return;
    }

    if (!isValidDomain(args[4])) {
        terminalMessage("Error: Dominio Invalido");
        return;
    }

    if (!args[4].endsWith(".")) {
        terminalMessage("Error: Dominio Debe Ser UN FQDN");
        return;
    }

    if (!isValidDomain(args[5])) {
        terminalMessage("Error: Autoridad Invalida");
        return;
    }

    if (!args[5].endsWith(".")) {
        terminalMessage("Error: Autoridad Debe Ser UN FQDN");
        return;
    }

    let record = new dnsRecord(args[4], "NS", args[5]);
    addDnsEntry(dataId, record);

}

function dns_A(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t A &lt;domain&gt; &lt;ip&gt; </p>");
        return;
    }

    if (!isValidDomain(args[4])) {
        terminalMessage("Error: Dominio Invalido");
        return;
    }

    if (!args[4].endsWith(".")) {
        terminalMessage("Error: Dominio Debe Ser UN FQDN");
        return;
    }
    
    if (!isValidIp(args[5])) {
        terminalMessage("Error: IP Invalida");
        return;
    }

    let record = new dnsRecord(args[4], "A", args[5]);
    addDnsEntry(dataId, record);
    terminalMessage("Registro A agregado correctamente para el dominio " + args[4]);
}

function dns_CNAME(dataId, args) {

    if (args.length !== 6) {
        terminalMessage("Error: Sintaxis: dns add -t CNAME &lt;domain&gt; &lt;alias&gt; </p>");
        return;
    }

    let record = new dnsRecord(args[4], "CNAME", args[5]);
    addDnsEntry(dataId, record);

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
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let i = 1;

    while ( i < records.length ) {
        let record = records[i];
        let cells = record.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        if (domain === targetDomain) {
            record.remove();
            terminalMessage(`Dominio ${targetDomain} borrado correctamente`);
            return;
        }
        i++;
    }

    terminalMessage("Error: No se encontró el nombre de dominio en la tabla de registros DNS.");
}

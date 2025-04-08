function isDomainInEtcHosts(dataId, domain) {
    const $networkObject = document.getElementById(dataId);
    const etcHostFile = $networkObject.getAttribute("data-etc-hosts");
    let etcHostsEntries = JSON.parse(etcHostFile);

    for (let ip in etcHostsEntries) {
        if (etcHostsEntries[ip].includes(domain))  return ip;
    }
    
    return false;
}

function addDnsCacheEntry(networkObjectId, query, answer_type, answer, server) {

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
class dnsRecord {
    constructor(domain, type, value) {
        this.domain = domain;
        this.type = type;
        this.value = value;
    }
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

    terminalMessage("Error: No se encontro el dominio en la tabla de registros DNS");
}

function isDomainInCache(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let FQDN_targetDomain = targetDomain;

    if (!isValidIp(targetDomain) && !targetDomain.endsWith(".")) {  //si no es ip, añadimos el punto al final para que sea un FQDN
        FQDN_targetDomain = FQDN_targetDomain + "." ;
    }

    let i = 1;

    while ( i < records.length ) {

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

function isDomainInCachePc(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let FQDN_targetDomain = targetDomain;

    if (!targetDomain.endsWith(".")) {  //añadimos el punto al final para que sea un FQDN
        FQDN_targetDomain = FQDN_targetDomain + "." ;
    }

    let i = 1;

    while (i < records.length) {

        let row = records[i];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;

        if (domain === FQDN_targetDomain) {

            if (type === "A" || type === "PTR") return [type, value];

            if (type === "CNAME") {
                let [translationType, translation] = isDomainInCachePc(networkObjectId, value);
                return [translationType, translation];
            }

        }

        i++;

    }

    return [false, false];

}

function addDnsCacheEntry(networkObjectId, domain, type, value) {

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
    dnsTable.appendChild(newRow);

}
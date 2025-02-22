class dnsRecord {
    constructor(domain, type, value) {
        this.domain = domain;
        this.type = type;
        this.value = value;
    }
}

function command_dns(dataId, args) {

    const $serverObject = document.getElementById(dataId);
    const validTypes = ["A", "CNAME"];
    const forbiddenChars = ["\\", "/", "ñ"]

    // sintaxis: dns <add|del> [ -t <type> ] <domain> <ip|cname>

    if (args[1] !== "add" && args[1] !== "del") {
        terminalMessage("Error: Sintaxis -> dns <add|del> [ -t <type> ] <domain> <ip|cname>");
        return;
    }

    if (args[1] === "add") {

        if (args[2] !== "-t"){

            if (args.length !== 4) {
                terminalMessage("Error: Sintaxis -> dns <add|del> [ -t <type> ] <domain> <ip|cname>");
                return;
            }

            forbiddenChars.forEach( char => { 
                if (args[2].includes(char)){
                    terminalMessage("Error: Nombre de Dominio Contiene Carácteres No Válidos")
                    return ;
                } 
            });

            if (!args[3].match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)){
                terminalMessage("Error: IP Invalida");
                return;
            }

            let record = new dnsRecord(args[2], "A", args[3]);
            addDnsEntry(dataId, record);
            return;
        }

        if (args[2] === "-t") {

            if (args.length !== 6) {
                terminalMessage("Error: Sintaxis -> dns <add|del> [ -t <type> ] <domain> <ip|cname>");
                return;
            }

            if (!validTypes.includes(args[3].toUpperCase())) {
                terminalMessage("Error: Tipo de Registro Desconocido.");
                return;
            }

            forbiddenChars.forEach( char => { 
                if (args[4].includes(char)){
                    terminalMessage("Error: Nombre de Dominio Contiene Carácteres No Válidos")
                    return ;
                } 
            });

            if (args[3].toUpperCase() !== "CNAME" && !args[5].match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)){
                terminalMessage("Error: IP Invalida");
                return;
            }
            
            let record = new dnsRecord(args[4], args[3], args[5]);
            addDnsEntry(dataId, record);
            return;
        }
    }

    if (args[1] === "del") {
        terminalMessage("Error: Comando no implementado");
    }

    terminalMessage("Error: Sintaxis -> dns <add|del> [ -t <type> ] <domain> <ip|cname>");
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

    terminalMessage("Comando dns ejecutado correctamente");

}

function isDomainInCache(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let i = 1;

    while ( i < records.length ) {

        let row = records[i];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;

        if (domain === targetDomain) {
            return [type, value];
        }

        i++;

    }

    return [false, false];

}

function addDnsCacheEntry(networkObjectId, domain, type, value) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <tr>
            <td>${domain}</td>
            <td>${type}</td>
            <td>${value}</td>
        </tr>`;
    dnsTable.appendChild(newRow);

}
function command_dns(dataId, args) {

    const $serverObject = document.getElementById(dataId);
    const validTypes = ["NS", "A", "CNAME", "PTR"];
    const forbiddenChars = ["\\", "/", "ñ"]

    // sintaxis: dns <add|del> [ -t <type> ] <domain> <ip|cname>

    if (!dataId.startsWith("dns-server")) {
        terminalMessage("Error: Comando solo implementado en servidores DNS");
        return;
    }

    if (args[1] === "add") {

        if (args[2] !== "-t"){

            if (args.length !== 4) {
                terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]</p>");
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

        }

        if (args[2] === "-t") {
            
            let type = args[3] || "none";
            type = type.toUpperCase();

            switch (type) {
                case "SOA":
                    dns_SOA(dataId, args);
                    break;
                case "NS":
                    dns_NS(dataId, args);
                    break;
                case "A":
                    dns_A(dataId, args);
                    break;
                case "CNAME":
                    dns_CNAME(dataId, args);
                    break;
                case "PTR":
                    dns_PTR(dataId, args);
                    break;
                default:
                    terminalMessage("Error: Tipo de Registro Desconocido.");
            }

        }

    } else if (args[1] === "del") {
        
        delDnsEntry(dataId, args[2])
       
    } else if (args[1] === "-s") {

        terminalMessage($serverObject.querySelector(".dns-table").querySelector("table").outerHTML);

    } else {

        terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]</p>");

    }

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
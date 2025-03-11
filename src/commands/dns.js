function command_dns(dataId, args) {

    const $serverObject = document.getElementById(dataId);
    const validTypes = ["A", "CNAME"];
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
            return;
        }

        if (args[2] === "-t") {

            if (args.length !== 6) {
                terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]</p>");
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
        delDnsEntry(dataId, args[2])
        return;
    }

    if (args[1] === "-s") {
        terminalMessage($serverObject.querySelector(".dns-table").querySelector("table").outerHTML);
        return;
    }

    terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]</p>");
}
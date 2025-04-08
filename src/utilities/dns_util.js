function command_dns(dataId, args) {

    const $serverObject = document.getElementById(dataId);
    const isNamedOn = $serverObject.getAttribute("named") === "true";
    const forbiddenChars = ["\\", "/", "ñ"];

    if (args[1] === "-s" || args[1] === "--show") {
        terminalMessage($serverObject.querySelector(".dns-table").querySelector("table").outerHTML);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {
        $serverObject.querySelector(".dns-table").querySelector("table").innerHTML = `
                    <tr>
                        <th>Dominio</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                    </tr>`;
        terminalMessage("La tabla de registros DNS ha sido limpiada correctamente.");
        return;
    }

    if (!isNamedOn) {
        terminalMessage("Error: Comando desconocido.");
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

            if (!isValidIp(args[3])) {
                terminalMessage("Error: IP Invalida");
                return;
            }

            let record = new dnsRecord(args[2], "A", args[3]);
            addDnsEntry(dataId, record);

        }

        if (args[2] === "-t") {
            
            let type = args[3] || "none";
            type = type.toUpperCase();

            const dnsRecordTypes = {
                "SOA": () => dns_SOA(dataId, args),
                "NS": () => dns_NS(dataId, args),
                "A": () => dns_A(dataId, args),
                "CNAME": () => dns_CNAME(dataId, args),
                "PTR": () => dns_PTR(dataId, args)
            }

            if (type in dnsRecordTypes) dnsRecordTypes[type]()
            else terminalMessage("Error: Tipo de Registro Desconocido.");
        }

        return;
    }
    
    if (args[1] === "del") {       
        delDnsEntry(dataId, args[2]);
        return;
    }
       
    terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]");

}
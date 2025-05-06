function command_dns(networkObjectId, args) {

    const $serverObject = document.getElementById(networkObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const isNamedOn = $serverObject.getAttribute("named") === "true";

    if (!isNamedOn) {
        terminalMessage("Error: Utilidad no disponible en este equipo.", networkObjectId);
        return;
    }
    
    if (args[1] === "-s" || args[1] === "--show") {
        terminalMessage($dnsTable.outerHTML, networkObjectId);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {

        $dnsTable.innerHTML = `
            <tr>
                <th>Dominio</th>
                <th>Tipo</th>
                <th>Valor</th>
            </tr>
        `;

        terminalMessage("La tabla de registros DNS ha sido limpiada correctamente.", networkObjectId);
        return;
    }

    if (args[1] === "add") {

        if (args[2] !== "-t"){ //<-- si no se especifica el tipo de registro, se asume que es A
            const domain = args[2];
            const value = args[3];
            let record = new dnsRecord(domain, "A", value);
            addDnsEntry(networkObjectId, record);
            terminalMessage("Se ha añadido correctamente el registro DNS.", networkObjectId);
            return;
        }

        if (args[2] === "-t") { //<-- si se especifica el tipo de registro, se valida primero
            
            let recordType = args[3] || "none";
            let domain = args[4];
            let value = args[5];

            const dnsRecordTypes = {
                "SOA": () => isValidSOARecord(networkObjectId, domain, value),
                "NS": () => isValidNSRecord(networkObjectId, domain, value),
                "A": () => isValidARecord(networkObjectId, domain, value),
                "CNAME": () => isValidCNAMERecord(networkObjectId, domain, value),
                "PTR": () => isValidPTRRecord(networkObjectId, domain, value)
            }

            if (recordType.toUpperCase() in dnsRecordTypes) { //<-- si el tipo de registro existe

                try {

                    dnsRecordTypes[recordType.toUpperCase()](); //<-- validamos el registro

                    let record = new dnsRecord(
                        domain, 
                        recordType, 
                        value
                    );

                    addDnsEntry(networkObjectId, record);
                    terminalMessage(`Se ha añadido correctamente el registro ${recordType.toUpperCase()}.`, networkObjectId);

                } catch (error) {

                    terminalMessage(error.message, networkObjectId);

                }

            }else {

                terminalMessage("Error: Tipo de Registro Desconocido.", networkObjectId);
                terminalMessage("Error: Sintaxis: dns add -t &lt;tipo&gt; &lt;dominio&gt; &lt;valor&gt;", networkObjectId);

            }
            
        }

        return;
    }
    
    if (args[1] === "del") { //<-- dns del <tipo> <dominio>
        let recordType= args[2];
        let domain = args[3];
        delDnsEntry(networkObjectId, recordType, domain);
        terminalMessage("Se ha eliminado correctamente el registro DNS.", networkObjectId);
        return;
    }
       
    terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]", networkObjectId);

}
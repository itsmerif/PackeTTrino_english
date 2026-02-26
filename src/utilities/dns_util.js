function command_dns(networkObjectId, args) {

    const $serverObject = document.getElementById(networkObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const isNamedOn = $serverObject.getAttribute("named") === "true";

    if (!isNamedOn) {
        terminalMessage("Error: Utility not available on this computer.", networkObjectId);
        return;
    }
    
    if (args[1] === "-s" || args[1] === "--show") {
        terminalMessage($dnsTable.outerHTML, networkObjectId);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {

        $dnsTable.innerHTML = `
            <tr>
                <th>Domain</th>
                <th>Type</th>
                <th>Value</th>
            </tr>
        `;

        terminalMessage("The DNS records table has been successfully cleaned.", networkObjectId);
        return;
    }

    if (args[1] === "add") {

        if (args[2] !== "-t"){ //<-- si no se especifica el tipo de registro, se asume que es A
            const domain = args[2];
            const value = args[3];
            let record = new dnsRecord(domain, "A", value);
            addDnsEntry(networkObjectId, record);
            terminalMessage("The DNS record was successfully added.", networkObjectId);
            return;
        }

        if (args[2] === "-t") { //<-- si se especifica el tipo de registro, se valida primero
            
            let recordType = args[3] || "none";
            let domain = args[4];
            let value = args[5];
            let serial = args[6];
            let cacheTTL = args[7];

            const dnsRecordTypes = {
                "SOA": () => isValidSOARecord(networkObjectId, domain, value, serial, cacheTTL),
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
                        value,
                    );

                    record.serial = serial;
                    record.cacheTTL = cacheTTL;

                    addDnsEntry(networkObjectId, record);
                    terminalMessage(`The record has been successfully added ${recordType.toUpperCase()}.`, networkObjectId);

                } catch (error) {

                    terminalMessage(error.message, networkObjectId);

                }

            }else {

                terminalMessage("Error: Unknown Record Type.", networkObjectId);
                terminalMessage("Error: Syntax: dns add -t &lt;tipo&gt; &lt;dominio&gt; &lt;valor&gt;", networkObjectId);

            }
            
        }

        return;
    }
    
    if (args[1] === "del") { //<-- dns del <tipo> <dominio>
        let recordType= args[2];
        let domain = args[3];
        delDnsEntry(networkObjectId, recordType, domain);
        terminalMessage("The DNS record was successfully deleted.", networkObjectId);
        return;
    }
       
    terminalMessage("Error: Syntax: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]", networkObjectId);

}

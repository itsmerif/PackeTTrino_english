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

        if (args[2] !== "-t"){  //dns add &lt;domain&gt; &lt;ip&gt;
            let record = new dnsRecord(args[2], "A", args[3]);
            addDnsEntry(networkObjectId, record);
            terminalMessage("Se ha añadido correctamente el registro DNS.", networkObjectId);
            return;
        }

        if (args[2] === "-t") {
            
            let type = args[3] || "none";
            type = type.toUpperCase();

            const dnsRecordTypes = {
                "SOA": () => dns_SOA(networkObjectId, args),
                "NS": () => dns_NS(networkObjectId, args),
                "A": () => dns_A(networkObjectId, args),
                "CNAME": () => dns_CNAME(networkObjectId, args),
                "PTR": () => dns_PTR(networkObjectId, args)
            }

            if (type in dnsRecordTypes) {
                dnsRecordTypes[type]();
                terminalMessage("Se ha añadido correctamente el registro DNS.", networkObjectId);
                return;
            }
            
            terminalMessage("Error: Tipo de Registro Desconocido.", networkObjectId);

        }

        return;
    }
    
    if (args[1] === "del") {       
        delDnsEntry(networkObjectId, args[2]);
        terminalMessage("Se ha eliminado correctamente el registro DNS.", networkObjectId);
        return;
    }
       
    terminalMessage("Error: Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]", networkObjectId);

}
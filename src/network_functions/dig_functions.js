function command_dig(dataId, args) {

    // sintaxis: dig <domain>

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis -> dig <domain>");
        return;
    }

    terminalMessage("Buscando información de dominio...");
    
    dig(dataId, args[1], true);

}

async function dig(dataId, domain, verbose = false) {

    cleanPacketTraffic()

    const $networkObject= document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    const [translationType, translation] = isDomainInCache(dataId, domain);

    if (!translation) { //no tenemos la ip en cache, buscamos en el servidor

        dnsRequestFlag = false;
        
        dnsRequestPacketGenerator(dataId, switchId, domain);

        setTimeout(() => {
            if (!dnsRequestFlag) {
                terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            } else {
                let [translationType, translation] = isDomainInCachePc(dataId, domain);
                if (verbose) {
                    terminalMessage(`Nombre de Dominio: ${domain}`);
                    terminalMessage(`Tipo de Registro: ${translationType}`);
                    terminalMessage(`Respuesta: ${translation}`);
                }
            }
        }, 500);

        return;
    }

    dnsRequestFlag = true;

    if (verbose) {
        terminalMessage(`Nombre de Dominio: ${domain}`);
        terminalMessage(`Tipo de Registro: ${translationType}`);
        terminalMessage(`Respuesta: ${translation}`);
    }

}

function isDomainInCachePc(networkObjectId, targetDomain) {

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

            if (type === "A") return [type, value];

            if (type === "CNAME") {
                let [translationType, translation] = isDomainInCachePc(networkObjectId, value);
                return [translationType, translation];
            }
            
        }

        i++;

    }

    return [false, false];

}
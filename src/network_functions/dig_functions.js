function command_dig(dataId, args) {

    // sintaxis: dig <domain>

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis -> dig <domain>");
        return;
    }

    dig(dataId, args[1]);
    terminalMessage("Buscando información de dominio...");

}

function dig(dataId, domain) {

    cleanPacketTraffic()

    const $networkObject= document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    const translationIp = isDomainInCache(dataId, domain);

    if (!translationIp) { //no tenemos la ip en cache, buscamos en el servidor
        dnsRequestPacketGenerator(dataId, switchId, domain);
        return;
    }

    //si tenemos la ip en cache, mostramos la información

    terminalMessage(`Nombre de Dominio: ${domain}`);
    terminalMessage(`Dirección IP: ${translationIp}`);

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
        let ip = cells[1].innerHTML;

        if (domain === targetDomain) {
            return ip;
        }

    }

    return false;
}
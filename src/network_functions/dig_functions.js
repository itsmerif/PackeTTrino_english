function command_dig(dataId, args) {

    // sintaxis: dig <domain>

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis -> dig <domain>");
        return;
    }

    terminalMessage("Buscando información de dominio...");
    dig(dataId, args[1]);
}

function dig(dataId, domain) {

    cleanPacketTraffic()

    const $networkObject= document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    const [translationType, translation] = isDomainInCache(dataId, domain);

    if (!translation) { //no tenemos la ip en cache, buscamos en el servidor
        dnsRequestPacketGenerator(dataId, switchId, domain);
        return;
    }

    dnsRequestFlag = true;

    terminalMessage(`Nombre de Dominio: ${domain}`);
    terminalMessage(`Tipo de Registro: ${translationType}`);
    terminalMessage(`Respuesta: ${translation}`);

}
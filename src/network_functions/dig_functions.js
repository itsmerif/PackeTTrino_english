async function dig(dataId, domain, verbose = false) {

    cleanPacketTraffic();

    const $networkObject = document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    let [translationType, translation] = isDomainInCachePc(dataId, domain); //buscamos en la tabla de cache del equipo

    if (!translation) { //no tenemos la ip en cache, buscamos en el servidor

        dnsRequestFlag = false;

        await dnsRequestPacketGenerator(dataId, switchId, domain);

        if (!dnsRequestFlag) { //el servidor no respondio
            if (verbose) terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            throw new Error("Error: No se pudo resolver el nombre de dominio.");
        } else {
            let packet = buffer[dataId];
            let query = packet.query;
            let answer = (!packet.answer) ? "" : packet.answer;
            let answer_type = packet.answer_type;
            let authority = packet.authority || "0";
            let server_ip = packet.origin_ip;       
            if (!answer) throw new Error("Error: No se pudo resolver el nombre de dominio.");
            addDnsCacheEntry(dataId, packet.query, packet.answer_type, packet.answer);      
            if (verbose) generateDnsOuput(query, answer_type, answer, authority, server_ip);
        }

        return;
    }

    dnsRequestFlag = true;
    if (verbose) generateDnsOuput(domain, translationType, translation);

}

function generateDnsOuput(query, answer_type, answer, authority, server_ip)  {
    const currentDate = new Date();
    const currentDateString = currentDate.toString();
    let answerBoolean = (!answer) ? "0" : "1";

    terminalMessage(`<p>QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 1</p>`);
    terminalMessage(`<p>QUESTION SECTION: </p>`);
    terminalMessage(`<p>${query.padEnd(15, " ")}` + " IN " + `${answer_type} </p>`);
    terminalMessage(`ANSWER SECTION:`);
    terminalMessage(`<p style="color: #86ff33;" >${query.padEnd(15, " ")}` + " 86400 IN " + `${answer_type}` + " " + `${answer} </p>`);
    terminalMessage("<p>Query time: 4 msec<p>");
    terminalMessage(`<p>SERVER: ${server_ip}#53(${server_ip}) (UDP)</p>`);
    terminalMessage("<p>WHEN: "+ currentDateString +"</p>");
    terminalMessage("<p>MSG SIZE  rcvd: 87</p>"); 
}

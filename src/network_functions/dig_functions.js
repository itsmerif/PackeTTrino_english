async function dig(dataId, domain, verbose = false) {

    cleanPacketTraffic();

    const $networkObject = document.getElementById(dataId);
    const switchId = $networkObject.getAttribute("data-switch");
    let [translationType, translation] = isDomainInCachePc(dataId, domain); //buscamos en la tabla de cache del equipo

    if (!translation) { //no tenemos la ip en cache, buscamos en el servidor

        dnsRequestFlag = false;

        await dnsRequestPacketGenerator(dataId, switchId, domain);

        if (!dnsRequestFlag) {

            if (verbose) terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            throw new Error("Error: No se pudo resolver el nombre de dominio.");

        } else {

            [translationType, translation] = isDomainInCachePc(dataId, domain);

            if (verbose) generateDnsOuput(domain, translationType, translation);

        }

        return;
    }

    dnsRequestFlag = true;

    if (verbose) generateDnsOuput(domain, translationType, translation);

}

function generateDnsOuput(domain, translationType, translation)  {

    const currentDate = new Date();
    const currentDateString = currentDate.toString();

    terminalMessage(`<p>QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1</p>`);
    terminalMessage(`<p>QUESTION SECTION: </p>`);
    terminalMessage(`<p>${domain.padEnd(15, " ")}` + " IN " + `${translationType} </p>`);
    terminalMessage(`ANSWER SECTION:`);
    terminalMessage(`<p style="color: #86ff33;" >${domain.padEnd(15, " ")}` + " 86400 IN " + `${translationType}` + " " + `${translation} </p>`);
    terminalMessage("<p>Query time: 4 msec<p>");
    terminalMessage("<p>SERVER: 172.16.24.130#53(172.16.24.130) (UDP)</p>");
    terminalMessage("<p>WHEN: "+ currentDateString +"</p>");
    terminalMessage("<p>MSG SIZE  rcvd: 87</p>");
    
}
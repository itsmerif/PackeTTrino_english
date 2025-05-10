class dnsRecord {
    constructor(domain, type, value) {
        this.domain = domain;
        this.type = type;
        this.value = value;
    }
}

/**ESTA FUNCION DEVUELVE FALSO O VERDADERO SI EL REGISTRO SOA DE UN DOMINIO YA EXISTE EN EL SERVIDOR*/
function hasSoaRecord(serverObjectId, targetDomain) {

    const $networkObject = document.getElementById(serverObjectId);
    const $dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const $soaRecords = $dnsTable.querySelectorAll(".SOA");
    let found = false;

    $soaRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domain = $fields[0].innerHTML;
        if (domain === targetDomain) found = true;
    });

    return found;

}

/**ESTA FUNCION DEVUELVE FALSO O VERDADERO SI UN SERVIDOR TIENE UN REGISTRO DE TIPO NS PARA UN DOMINIO*/
function hasNsRecord(serverObjectId, targetDomain) {
    const $networkObject = document.getElementById(serverObjectId);
    const $dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const $nsRecords = $dnsTable.querySelectorAll(".NS");
    let found = false;

    $nsRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domain = $fields[0].innerHTML;
        if (domain === targetDomain) found = true;
    });

    return found;
}

/**ESTA FUNCION DEVUELVE EL VALOR DE UN REGISTRO DE TIPO A*/
function getARecord(dataId, name) {
    const $networkObject = document.getElementById(dataId);
    const $dnsTable = $networkObject.querySelector(".dns-table").querySelector("table");
    const $aRecords = $dnsTable.querySelectorAll(".A");
    let response = false;

    $aRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domainName = $fields[0].innerHTML
        const value = $fields[2].innerHTML;
        if (domainName === name) response = value;
    });

    return response;
}

/**ESTA FUNCION VALIDA UN REGISTRO SOA */
function isValidSOARecord(dataId, domain, authorityNameServer) {
    if (!isValidDomain(domain)) throw new Error(`Error: dominio ${domain} inválido`);
    if (!domain.endsWith(".")) throw new Error(`Error: el dominio ${domain} debe ser un FQDN`);
    if (!isValidDomain(authorityNameServer)) throw new Error(`Error: servidor autoritario ${authorityNameServer} inválido`);
    if (!authorityNameServer.endsWith(".")) throw new Error(`Error: el servidor autoritario ${authorityNameServer} debe ser un FQDN`);
    if (hasSoaRecord(dataId, domain)) throw new Error(`Error: Ya existe un registro de SOA para ${domain}.`);
}

/**ESTA FUNCION VALIDA UN REGISTRO NS */
function isValidNSRecord(dataId, domain, authorityNameServer) {
    if (!hasSoaRecord(dataId, domain)) throw new Error(`Error: El dominio ${domain} debe tener primero un registro SOA.`);
    if (!isValidDomain(domain)) throw new Error("Error: Dominio Invalido");
    if (!domain.endsWith(".")) throw new Error("Error: Dominio Debe Ser UN FQDN");
    if (!isValidDomain(authorityNameServer)) throw new Error("Error: Autoridad Invalida");
    if (!authorityNameServer.endsWith(".")) throw new Error("Error: Autoridad Debe Ser UN FQDN");
}

/**ESTA FUNCION VALIDA UN REGISTRO A */
function isValidARecord(serverObjectId, name, value) {
    if (!isValidDomain(name)) throw new Error(`Error: Nombre ${name} Invalido`);
    let domain = name.split(".").slice(1).join("."); //<-- extraemos el dominio del nombre
    if (!hasSoaRecord(serverObjectId, domain)) throw new Error(`Error: El dominio ${domain} debe tener primero un registro SOA.`);
    if (!hasNsRecord(serverObjectId, domain)) throw new Error(`Error: El dominio ${domain} debe tener primero un registro NS.`);
    if (!name.endsWith(".")) throw new Error(`Error: El nombre ${name} debe ser un FQDN`);
    if (!isValidIp(value)) throw new Error(`Error: IP ${value} Invalida`);
}

/**ESTA FUNCION VALIDA UN REGISTRO CNAME */
function isValidCNAMERecord(serverObjectId, alias, name) {
    if (!isValidDomain(alias)) throw new Error(`Error: Dominio ${alias} inválido`);
    if (!alias.endsWith(".")) throw new Error(`Error: el dominio ${alias} debe ser un FQDN`);
    if (!isValidDomain(name)) throw new Error(`Error: Dominio ${name} inválido`);
    if (!name.endsWith(".")) throw new Error(`Error: el dominio ${name} debe ser un FQDN`);
    if (!getARecord(serverObjectId, name)) throw new Error(`Error: El dominio ${name} debe tener primero un registro A.`);
}

/**ESTA FUNCIONA DEVUELVE LA IP DE UN NOMBRE DE DOMINIO QUE ESTÉ ALMACENADO EN /ETC/HOSTS, O DEVUELVE FALSO SI NO EXISTE */
function getDomainFromEtcHosts(networkObjectId, inputDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    let response = false; //<-- inicializamos la respuesta a falso
    let fileSystem = new FileSystem($networkObject); //<-- creamos un objeto de sistema de archivos
    let directoryPath = pathBuilder("/etc/hosts");
    let fileName = directoryPath.pop(); 
    
    try {

        const etcHostsContent = fileSystem.open(fileName, directoryPath); //<-- obtenemos el contenido del archivo
        const lines = etcHostsContent.split("\n"); //<-- dividimos el contenido en lineas

        lines.forEach(line => {
            const tokens = line.replace(/\s+/g, " ").trim().split(" "); //<-- dividimos la linea en tokens
            const lineIp = tokens[0]; //<-- obtenemos la ip de cada linea
            const lineDomains = tokens.slice(1); //<-- obtenemos los dominios asociados

            lineDomains.forEach(domain => {
                if (domain === inputDomain) response = lineIp; //<-- si el dominio es igual al que estamos buscando, devolvemos la ip
            });

        });

    } catch (e) {

        response = false;

    }

    return response;

}

/**ESTA FUNCION AÑADE UN REGISTRO DNS A LA BASE DE DATOS DE UN SERVIDOR DNS*/
function addDnsEntry(serverObjectId, newrecord) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table")
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${newrecord.domain}</td>
        <td>${(newrecord.type).toUpperCase()}</td>
        <td>${newrecord.value}</td>
    `;
    
    newRow.classList.add(newrecord.type.toUpperCase()); //<-- añadimos el tipo de registro a la fila
    dnsTable.appendChild(newRow);

    if (newrecord.type === "A") { //<-- si se trata de un registro de tipo A, se genera automaticamente un registro PTR
        const ptrRecord = document.createElement("tr");
        ptrRecord.innerHTML = `
            <td>${(newrecord.value).split(".").reverse().join(".") + ".IN-ADDR.ARPA."}</td>
            <td>PTR</td>
            <td>${newrecord.domain}</td>
        `;
        ptrRecord.classList.add("PTR");
        dnsTable.appendChild(ptrRecord);
    }

}

/**ESTA FUNCION ELIMINA UN REGISTRO DNS DE UN SERVIDOR*/
function delDnsEntry(serverObjectId, recordType, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");

    if (recordType.toUpperCase() === "SOA") { //<-- si es un registro de tipo SOA, se elimina la zona completa
        dropDnsZone(serverObjectId, targetDomain);
        return;
    }

    const $records = $dnsTable.querySelectorAll(`.${recordType.toUpperCase()}`);

    $records.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const domain = $fields[0].innerHTML;
        if (domain === targetDomain) $record.remove();
    });

    if (recordType.toUpperCase() === "A") { //<-- si se trata de un registro de tipo A, se elimina el registro PTR asociado
        const $ptrRecords = $dnsTable.querySelectorAll(`.${"PTR"}`);
        $ptrRecords.forEach($ptrRecord => {
            const $ptrFields = $ptrRecord.querySelectorAll("td");
            const domain = $ptrFields[2].innerHTML;
            if (domain === targetDomain) $ptrRecord.remove();
        });
    }

}

/**ESTA FUNCION GENERA UNA RESPUESTA DNS DE UN PAQUETE EN LA CONSOLA*/
function generateDnsOuput(packet, networkObjectId) {

    //campos del paquete

    let query = packet.query;
    let answer = packet.answer || "";
    let answer_type = packet.answer_type;
    let authority = packet.authority || "0"; //solo para SOA
    let authority_domain = packet.authority_domain || ""; //solo para SOA
    let server_ip = packet.origin_ip;
    let answerBoolean = (!answer || (authority === "1" && query !== authority_domain)) ? "0" : "1";

    //fecha actual

    const currentDate = new Date();
    const currentDateString = currentDate.toString();

    //header

    terminalMessage(`<p>QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 0</p>`, networkObjectId);

    //seccion de query

    terminalMessage(`<p>QUESTION SECTION: </p>`, networkObjectId);
    terminalMessage(`<p>${query.padEnd(15, " ")}` + " IN " + `${answer_type} </p>`, networkObjectId);

    //seccion de respuesta

    if (answer) {
        terminalMessage(`ANSWER SECTION:`, networkObjectId);
        if (typeof answer === 'string') {
            terminalMessage(`<p>${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer}</p>`, networkObjectId);
        } else {
            for (let i = 0; i < answer.length; i++) {
                terminalMessage(`<p>${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer[i]}</p>`, networkObjectId);
            }
        }
    }

    //seccion de autoridad

    if (authority !== "0") {
        terminalMessage(`AUTHORITY SECTION:`, networkObjectId);
        terminalMessage(`<p>${authority_domain.padEnd(15, " ")}` + " 86400 IN " + `${answer_type}` + " " + `${authority} </p>`, networkObjectId);
    }

    //seccion de tiempo
    terminalMessage("<p>Query time: 4 msec<p>", networkObjectId);
    terminalMessage(`<p>SERVER: ${server_ip}#53(${server_ip}) (UDP)</p>`, networkObjectId);
    terminalMessage("<p>WHEN: " + currentDateString + "</p>", networkObjectId);
    terminalMessage("<p>MSG SIZE  rcvd: 87</p>", networkObjectId);
}

/**ESTA FUNCION DEVUELVE [TIPO, VALOR, SERVIDOR QUE DIO LA RESPUESTA] DE UN DOMINIO EN CACHE DNS*/
function isDomainInCacheDns(networkObjectId, targetDomain) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let FQDN_targetDomain = targetDomain;

    if (!targetDomain.endsWith(".")) FQDN_targetDomain = FQDN_targetDomain + ".";

    let i = 1;

    while (i < records.length) {

        let row = records[i];
        let server = row.getAttribute("data-server");
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;

        if (domain === FQDN_targetDomain) {

            if (type === "A" || type === "PTR") return [type, value, server];

            if (type === "CNAME") {
                let [translationType, translation] = isDomainInCacheDns(networkObjectId, value);
                return [translationType, translation, server];
            }

        }

        i++;

    }

    return [false, false, false];

}

/**ESTA FUNCIÓN AÑADE UN REGISTRO A LA CACHE DNS*/
function addDnsCacheEntry(networkObjectId, domain, recordType, value, server) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const newRow = document.createElement("tr");

    if (!domain.endsWith(".")) domain = domain + "."; //<-- los nombres se guardan como FQDN

    if (typeof value !== 'string') value = value[0]; //<-- si tenemos un array de ips, nos quedamos con la primera ip

    newRow.innerHTML = `
        <td>${domain}</td>
        <td>${recordType}</td>
        <td>${value}</td>
    `;

    newRow.setAttribute("data-server", server); //<-- se añade el servidor al que se hizo la consulta
    
    dnsTable.appendChild(newRow);

}

/**ESTA FUNCION DEVUELVE EL VALOR DE UN REGISTRO DE TIPO A EN UN SERVIDOR DNS*/
function iterativeDnsQuery(serverObjectId, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $records = $dnsTable.querySelectorAll("tr");
    let response = false;

    $records.forEach($record => {       
        const $fields = $record.querySelectorAll("td");       
        if ($fields.length === 0) return;    
        const domain = $fields[0].innerHTML;
        const recordType = $fields[1].innerHTML;
        const value = $fields[2].innerHTML;
        if (domain === targetDomain && (recordType === "A" || recordType === "PTR")) response = value;
        if (domain === targetDomain && recordType === "CNAME") response = iterativeDnsQuery(serverObjectId, value); //<-- si es un CNAME, se busca en el dominio que apunta
    });
    
    return response;
}

/**ESTA FUNCION ELIMINA TODOS LOS REGISTROS DE UN DOMINIO*/
function dropDnsZone(serverObjectId, domain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");  
    const $dnsRecords = $dnsTable.querySelectorAll("tr");

    $dnsRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        if ($fields.length === 0) return;
        const name = $fields[0].innerHTML;
        if (name === domain || name.endsWith(`.${domain}`)) $record.remove();
    });

}
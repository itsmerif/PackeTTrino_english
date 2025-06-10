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
function isValidSOARecord(dataId, domain, authorityNameServer, serial, cacheTTL) {
    if (!isValidDomain(domain)) throw new Error(`Error: dominio ${domain} inválido`);
    if (!domain.endsWith(".")) throw new Error(`Error: el dominio ${domain} debe ser un FQDN`);
    if (!isValidDomain(authorityNameServer)) throw new Error(`Error: servidor autoritario ${authorityNameServer} inválido`);
    if (!authorityNameServer.endsWith(".")) throw new Error(`Error: el servidor autoritario ${authorityNameServer} debe ser un FQDN`);
    if (isNaN(cacheTTL)) throw new Error(`Error: el TTL ${cacheTTL} no es válido.`);
    if (cacheTTL < 0 || cacheTTL > 86400) throw new Error(`Error: el TTL ${cacheTTL} debe ser un numero entre 0 y 86400.`);
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

        const etcHostsContent = fileSystem.read(fileName, directoryPath); //<-- obtenemos el contenido del archivo
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
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table")
    const $newRecord = document.createElement("tr");

    if (newrecord.type === "SOA") {
        $newRecord.setAttribute("data-serial", newrecord.serial);
        $newRecord.setAttribute("data-cache-ttl", newrecord.cacheTTL);
    }

    $newRecord.innerHTML = `
        <td>${newrecord.domain}</td>
        <td>${(newrecord.type).toUpperCase()}</td>
        <td>${newrecord.value}</td>
    `;

    $newRecord.classList.add(newrecord.type.toUpperCase()); //<-- añadimos el tipo de registro a la fila
    $dnsTable.appendChild($newRecord);

    if (newrecord.type === "A") { //<-- si se trata de un registro de tipo A, se genera automaticamente un registro PTR
        const ptrRecord = document.createElement("tr");
        ptrRecord.innerHTML = `
            <td>${(newrecord.value).split(".").reverse().join(".") + ".IN-ADDR.ARPA."}</td>
            <td>PTR</td>
            <td>${newrecord.domain}</td>
        `;
        ptrRecord.classList.add("PTR");
        $dnsTable.appendChild(ptrRecord);
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

    const currentDate = new Date();
    const currentDateString = currentDate.toString();
    let query = packet.query;
    let answer = packet.answer || "";
    let answer_type = packet.answer_type;
    let authority = packet.authority || "0"; //solo para SOA
    let authority_domain = packet.authority_domain || ""; //solo para SOA
    let serial = packet.serial || ""; //solo para SOA
    let cache_ttl = packet.cache_ttl || ""; //solo para SOA
    let server_ip = packet.origin_ip;
    let answerBoolean = (!answer || (authority === "1" && query !== authority_domain)) ? "0" : "1";

    //header
    let message = `QUERY: 1, ANSWER: ${answerBoolean}, AUTHORITY: ${authority}, ADDITIONAL: 0\n`;

    //seccion de query
    message += `\nQUESTION SECTION:\n`;
    message += `${query.padEnd(15, " ")} IN ${answer_type}\n`;

    //seccion de respuesta

    if (answer && authority === "0") {

        message += `\nANSWER SECTION:\n`;

        for (let i = 0; i < answer.length; i++) {
            message += `${query.padEnd(15, " ")} 86400 IN ${answer_type} ${answer[i]}\n`;
        }

    }

    //seccion de autoridad

    if (authority !== "0") {
        message += `\nAUTHORITY SECTION:\n`;
        message += `${authority_domain.padEnd(15, " ")} 86400 IN ${answer_type} ${answer} ${serial} ${cache_ttl}\n`;
    }

    //seccion de tiempo
    message += `\nQuery time: 4 msec\n`;
    message += `SERVER: ${server_ip}#53(${server_ip}) (UDP)\n`;
    message += `WHEN: ${currentDateString}\n`;
    message += `MSG SIZE  rcvd: 87\n`;

    terminalMessage(message, networkObjectId);
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

/**ESTA FUNCIÓN AÑADE UN REGISTRO A LA CACHE DNS DE UN DISPOSITIVO FINAL*/
function addDnsCacheEntry(networkObjectId, dnsReplyPacket) {

    const $networkObject = document.getElementById(networkObjectId);
    const dnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const newRow = document.createElement("tr");

    //desglosamos el paquete de respuesta

    const domain = dnsReplyPacket.query;
    const recordType = dnsReplyPacket.answer_type;
    const value = dnsReplyPacket.answer[0]; //tomamos el primer valor
    const server = dnsReplyPacket.origin_ip;
    const ttl = dnsReplyPacket.cache_ttl;

    //los nombres se guardan como FQDN

    if (!domain.endsWith(".")) domain = domain + ".";

    //se añade el registro

    newRow.innerHTML = `
        <td>${domain}</td>
        <td>${recordType}</td>
        <td>${value}</td>
    `;

    newRow.setAttribute("data-server", server);
    dnsTable.appendChild(newRow);

    //generamos un timer para la cache dns

    console.log(`Se ha añadido el registro DNS de ${domain} a ${networkObjectId} durante ${ttl} segundos`);

    dnsCacheTimers[`${networkObjectId}-${domain}-${value}`] = setTimeout(() => {
        delDnsCacheEntry(networkObjectId, domain);
    }, ttl * 1000);

}

/**ESTA FUNCION ELIMINA UNA ENTRADA DE LA TABLA DE CACHE DNS DE UN OBJETO DE RED*/
function delDnsCacheEntry(networkObjectId, domain) {
    const $networkObject = document.getElementById(networkObjectId);
    const $cacheDnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    const $records = $cacheDnsTable.querySelectorAll("tr");

    for (let i = 1; i < $records.length; i++) {
        const $record = $records[i];
        const $fields = $record.querySelectorAll("td");
        const recordDomain = $fields[0].innerText.trim();
        if (recordDomain === domain) {
            clearTimeout(dnsCacheTimers[`${networkObjectId}-${recordDomain}`]);
            delete dnsCacheTimers[`${networkObjectId}-${recordDomain}`];
            $record.remove();
            break;
        }
    }
}

/**ESTA FUNCIÓN AÑADE UN REGISTRO A LA CACHE DNS DE UN SERVIDOR*/
function addDnsCacheEntryServer(serverObjectId, domain, recordType, value) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".cache-dns-table").querySelector("table");
    const newRow = document.createElement("tr");

    //los nombres se guardan como FQDN

    if (!domain.endsWith(".")) domain = domain + ".";

    //se añade el registro

    newRow.innerHTML = `
        <td>${domain}</td>
        <td>${recordType}</td>
        <td>${value}</td>
    `;

    dnsTable.appendChild(newRow);

}

/**ESTA FUNCION DEVUELVE EL VALOR DE UN REGISTRO DE TIPO A EN UN SERVIDOR DNS*/
function iterativeDnsQuery(serverObjectId, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $records = $dnsTable.querySelectorAll("tr");
    const response = [];

    $records.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        if ($fields.length === 0) return;
        const domain = $fields[0].innerHTML;
        const recordType = $fields[1].innerHTML;
        const value = $fields[2].innerHTML;
        if (domain === targetDomain && (recordType === "A" || recordType === "PTR")) response.push(value);
        //si es un CNAME, se busca en el dominio que apunta
        if (domain === targetDomain && recordType === "CNAME") response.push(iterativeDnsQuery(serverObjectId, value));
    });

    if (response.length === 0) return false;

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

/**ESTA FUNCION DEVUELVE UN OBJETO CON LAS INFORMACIONES DE UN REGISTRO SOA DE UN DOMINIO EN UN SERVIDOR DNS*/
function getSoaRecord(serverObjectId, targetDomain) {

    const $serverObject = document.getElementById(serverObjectId);
    const $dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const $soaRecords = $dnsTable.querySelectorAll(".SOA");

    const response = {};

    $soaRecords.forEach($record => {
        const $fields = $record.querySelectorAll("td");
        const soaDomain = $fields[0].innerHTML;
        if (targetDomain.endsWith(`.${soaDomain}`) || soaDomain === targetDomain) {
            response["authorityNameServer"] = $fields[2].innerHTML;
            response["authorityDomain"] = soaDomain;
            response["serial"] = $record.getAttribute("data-serial");
            response["cacheTTL"] = $record.getAttribute("data-cache-ttl");
        }
    });

    return response;

}

/**ESTA FUNCION DEVUELVE LA LISTA DE SERVIDORES DNS COMO ARRAY DEL ARCHIVO /etc/resolv.conf*/
function getDnsServers(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    const fileContent = networkObjectFileSystem.read("resolv.conf", ["etc"]);
    return fileContent.split("\n")
        .map(line => line.trim().replace(/\s+/g, " "))
        .filter(line => line !== "" && !line.startsWith("#") && line.startsWith("nameserver"))
        .map(line => line.split(" ")[1])
        .filter(line => isValidIp(line));
}

/**ESTA FUNCION CONFIGURA LOS SERVIDORES DNS DE UN EQUIPO */
function setDnsServers(networkObjectId, dnsServers) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    let fileContent = "";
    dnsServers.forEach(dnsServer => fileContent += `nameserver ${dnsServer}\n`);
    networkObjectFileSystem.write("resolv.conf", ["etc"], fileContent);
}

/**ESTA FUNCION FLUSHEA LA CACHE DNS DE UN EQUIPO */
function flushDnsCache(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $cacheDnsTable = $networkObject.querySelector(".cache-dns-table").querySelector("table");
    $cacheDnsTable.innerHTML = `
        <tr>
            <th>Dominio</th>
            <th>Tipo de Registro</th>
            <th>Valor</th>
        </tr>
    `;
}
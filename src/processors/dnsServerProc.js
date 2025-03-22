async function packetProcessor_dns_server(switchId, serverObjectId, packet) {

    if (visualToggle) await visualize(switchId, serverObjectId, packet);

    if (!firewallProcessorHost(serverObjectId, packet)) return;

    const $serverObject = document.getElementById(serverObjectId);
    const serverObjectMac = $serverObject.getAttribute("data-mac");
    const serverObjectIp = $serverObject.getAttribute("data-ip");
    const isRecursive = $serverObject.getAttribute("recursion");

    //comportamiento como equipo normal

    if (packet.protocol === "arp" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp) return;
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        let newPacket = new ArpReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "arp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp) return;
        addARPEntry(serverObjectId, packet.origin_ip, packet.origin_mac);
        if (buffer[serverObjectId]) {
            buffer[serverObjectId].destination_mac = isIpInARPTable(serverObjectId, packet.origin_ip);
            addPacketTraffic(buffer[serverObjectId]);
            await switchProcessor(switchId, serverObjectId, buffer[serverObjectId]);
            delete buffer[serverObjectId];
        }
    }

    if (packet.protocol === "icmp" && packet.type === "request") {
        if (packet.destination_ip !== serverObjectIp || packet.destination_mac !== serverObjectMac) return;
        let newPacket = new IcmpEchoReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac);
        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;
    }

    if (packet.protocol === "icmp" && packet.type === "reply") {
        if (packet.destination_ip !== serverObjectIp || packet.destination_mac !== serverObjectMac) return;
        icmpFlag = true;
    }

    //comportamiento como servidor dns

    if (packet.protocol === "dns" && packet.type === "request") {

        if (packet.destination_mac !== serverObjectMac || packet.destination_ip !== serverObjectIp) return;

        let newPacket = new dnsReply(serverObjectIp, packet.origin_ip, serverObjectMac, packet.origin_mac, packet.query, ""); //inicializamos el paquete sin respuesta
        let answer;

        if (packet.answer_type === "SOA") {
            let authority_domain;
            [authority_domain, answer] = dns_SOA_Request_Proc(serverObjectId, packet);
            newPacket.answer_type = "SOA";
            newPacket.answer = answer;
            newPacket.authority_domain = authority_domain;
            if (answer) newPacket.authority = "1";
        }

        if (packet.answer_type === "A") {
            answer = dns_A_Request_Proc(serverObjectId, packet);
            if (!answer && isRecursive !== "false") answer = await recursiveDNSResolve(packet.query);
            newPacket.answer_type = "A";
            newPacket.answer = answer;
        }

        addPacketTraffic(newPacket);
        await switchProcessor(switchId, serverObjectId, newPacket);
        return;

    }

}

function dns_SOA_Request_Proc(serverObjectId, packet) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let recordIndex;
    let query = packet.query; // google.com
    let targetDomain;
    let response = [false, false];

    //nos aseguramos de que el dominio que estamos buscando sea un FQDN

    if (!query.endsWith(".")) query = query + "."; // google.com.
    query = query.split("."); // ["google", "com", ""]

    //buscamos en la tabla de registros DNS en cada nivel de autoridad

    for (let i = 0; i < query.length; i++) {
        targetDomain = query.slice(i).join("."); // "google.com.", "com.", "."
        recordIndex = 1;
        while (recordIndex < records.length && !response[0]) {
            let row = records[recordIndex];
            let cells = row.querySelectorAll("td");
            let domain = cells[0].innerHTML;
            let type = cells[1].innerHTML;
            let value = cells[2].innerHTML;
            if (targetDomain === domain && type === "SOA") response = [targetDomain, value];
            recordIndex++;
        }
    }

    return response;
}

function dns_A_Request_Proc(serverObjectId, packet) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let response = false;
    let recordIndex;
    let query = packet.query; // www.google.com

    //nos aseguramos de que el dominio que estamos buscando sea un FQDN

    if (!query.endsWith(".")) query = query + "."; // google.com.

    //buscamos en la tabla de registros

    recordIndex = 1;

    while (recordIndex < records.length && !response) {
        let row = records[recordIndex];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;
        if (domain === query && type === "CNAME") query = value // www.google.com -> google.com
        if (domain === query && type === "A") response = value;
        recordIndex++;
    }

    return response;

}

async function recursiveDNSResolve(domain) {
    try {
        const response = await fetch("https://dns.google.com/resolve?name=" + domain + "&type=A");
        const reply = await response.json();
        let answer = [];
        for (let i = 0; i < reply.Answer.length; i++) {
            answer.push(reply.Answer[i].data);
        }
        console.log(answer);
        return answer;
    } catch (error) {
        console.log(error);
        return false;
    }
}
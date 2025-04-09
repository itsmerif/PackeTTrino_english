async function named_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch");
    const isRecursive = $networkObject.getAttribute("recursion");

    if (packet.destination_mac !== networkObjectMac || packet.destination_ip !== networkObjectIp) return;

    let newPacket = new dnsReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.query, ""); //inicializamos el paquete sin respuesta
    let answer;

    if (packet.answer_type === "SOA") {
        let authority_domain;
        [authority_domain, answer] = dns_SOA_Request_Proc(networkObjectId, packet);
        newPacket.answer_type = "SOA";
        newPacket.answer = answer;
        newPacket.authority_domain = authority_domain;
        if (answer) newPacket.authority = "1";
    }

    if (packet.answer_type === "A") {
        answer = dns_A_Request_Proc(networkObjectId, packet);
        if (!answer && isRecursive !== "false") answer = await recursiveDNSResolve(packet.query);
        newPacket.answer_type = "A";
        newPacket.answer = answer;
    }

    addPacketTraffic(newPacket);
    await switchProcessor(switchId, networkObjectId, newPacket);
    return;

}

function dns_SOA_Request_Proc(serverObjectId, packet) {

    const $serverObject = document.getElementById(serverObjectId);
    const dnsTable = $serverObject.querySelector(".dns-table").querySelector("table");
    const records = dnsTable.querySelectorAll("tr");
    let recordIndex;
    let query = packet.query;
    let targetDomain;
    let response = [false, false];

    if (!query.endsWith(".")) query = query + "."; 
    query = query.split(".");

    for (let i = 0; i < query.length; i++) {
        targetDomain = query.slice(i).join(".");
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
    let query = packet.query;

    if (!query.endsWith(".")) query = query + ".";

    recordIndex = 1;

    while (recordIndex < records.length && !response) {
        let row = records[recordIndex];
        let cells = row.querySelectorAll("td");
        let domain = cells[0].innerHTML;
        let type = cells[1].innerHTML;
        let value = cells[2].innerHTML;
        if (domain === query && type === "CNAME") query = value;
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
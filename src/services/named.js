async function named_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    const isRecursive = $networkObject.getAttribute("recursion");

    if (packet.destination_mac !== networkObjectMac || packet.destination_ip !== networkObjectIp) return;

    let newPacket = new dnsReply(networkObjectIp, packet.origin_ip, networkObjectMac, packet.origin_mac, packet.query, ""); //inicializamos el paquete sin respuesta

    if (packet.answer_type === "SOA") {
        let [authority_domain, answer] = dns_SOA_Request_Proc(networkObjectId, packet);
        newPacket.answer_type = "SOA";
        newPacket.answer = answer;
        newPacket.authority_domain = authority_domain;
        if (answer) newPacket.authority = "1";
    }

    if (packet.answer_type === "A") {
        let answer = dns_A_Request_Proc(networkObjectId, packet);
        if (!answer && isRecursive !== "false") answer = await recursiveDNSResolve(packet.query);
        newPacket.answer_type = "A";
        newPacket.answer = answer;
    }

    return newPacket;

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
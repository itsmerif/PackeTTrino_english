/**ESTA FUNCION COMPRUEBA SI UN PAQUETE SUPERA EL CORTAFUEGOS (TABLA FILTER) */
function firewallProcessorFilter(networkObjectId, packet, interface = "enp0s3")  {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicies = JSON.parse($networkObject.getAttribute("firewall-default-policy"));
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    const firewallRulesFilter = firewallRules["FILTER"];
    const networkObjectIPs = getAvailableIps(networkObjectId);
    let targetChain;
    let response = false;
    let found = false;

    if (networkObjectIPs.includes(packet.destination_ip)) {
        targetChain = "INPUT";
    } else if (networkObjectIPs.includes(packet.origin_ip)) {
        targetChain = "OUTPUT";
    } else {
        targetChain = "FORWARD";
    }

    const defaultPolicy = defaultPolicies[targetChain];

    firewallRulesFilter.forEach(rule => {

        let ruleChain = rule.A;
        let ruleProtocol = rule.p;
        let ruleOriginIp = rule.s;
        let ruleDestinationIp = rule.d;
        let ruleInterface = rule.i;
        let ruleOriginPort = rule.sport;
        let ruleDestinationPort = rule.dport;
        let ruleAction = rule.j;

        if (ruleChain !== targetChain) return;

        if (ruleProtocol !== "*" && ruleProtocol !== packet.transport_protocol && ruleProtocol !== packet.protocol) return;

        if (ruleOriginIp !== "*" && ruleOriginIp !== packet.origin_ip) return;

        if (ruleDestinationIp !== "*" && ruleDestinationIp !== packet.destination_ip) return;

        if (ruleInterface !== "*" && ruleInterface !== interface) return;

        if (ruleOriginPort !== "*" && ruleOriginPort !== packet.sport) return;

        if (ruleDestinationPort !== "*" && ruleDestinationPort !== packet.dport) return;

        found = true;

        if (ruleAction === "ACCEPT") response = true;

        if (ruleAction === "DROP") response = false;
    });

    if (!found) response = defaultPolicy === "ACCEPT";
    
    return response;

}
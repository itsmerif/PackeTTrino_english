function firewallProcessor(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicies = JSON.parse($networkObject.getAttribute("firewall-default-policy"));
    const networkObjectIPs = getAvailableIps(networkObjectId);
    const $firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const $rules = $firewallTable.querySelectorAll("tr");

    let targetChain;

    if (networkObjectIPs.includes(packet.destination_ip)) {
        targetChain = "INPUT";
    } else if (networkObjectIPs.includes(packet.origin_ip)) {
        targetChain = "OUTPUT";
    } else {
        targetChain = "FORWARD";
    }

    const defaultPolicy = defaultPolicies[targetChain];
    let response = false;
    let found = false;

    $rules.forEach($rule => {

        const $fields = $rule.querySelectorAll("td");

        if ($fields.length < 1) return;
        
        const ruleChain = $fields[1].innerHTML;
        const ruleProtocol = $fields[2].innerHTML;
        const ruleOriginIp = $fields[3].innerHTML;
        const ruleDestinationIp = $fields[4].innerHTML;
        const ruleOriginPort = parseInt($fields[5].innerHTML) || "*";
        const ruleDestinationPort = parseInt($fields[6].innerHTML) || "*";
        const ruleAction = $fields[7].innerHTML;

        if (ruleChain !== targetChain) return;

        if (ruleProtocol !== "*" && ruleProtocol !== packet.transport_protocol && ruleProtocol !== packet.protocol) return;

        if (ruleOriginIp !== "*" && ruleOriginIp !== packet.origin_ip) return;

        if (ruleDestinationIp !== "*" && ruleDestinationIp !== packet.destination_ip) return;

        if (ruleOriginPort !== "*" && ruleOriginPort !== packet.sport) return;

        if (ruleDestinationPort !== "*" && ruleDestinationPort !== packet.dport) return;

        found = true;

        if (ruleAction === "ACCEPT") response = true;

        if (ruleAction === "DROP") response = false;

    });

    if (!found) response = defaultPolicy === "ACCEPT";
    
    return response;
}
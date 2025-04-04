function firewallProcessorHost(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicy = $networkObject.getAttribute("firewall-default-policy");
    const firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rules = firewallTable.querySelectorAll("tr");
    const networkObjectIP = $networkObject.getAttribute("data-ip");

    //definimos variables de regla objetivo

    let targetChain;

    if (packet.destination_ip === networkObjectIP) {
        targetChain = "INPUT";
    }

    let i = 1;

    while (i < rules.length) {

        const rule = rules[i];
        const cells = rule.querySelectorAll("td");
        const ruleChain = cells[1].innerHTML;
        const ruleProtocol = cells[2].innerHTML;
        const ruleOrigin = cells[3].innerHTML;
        const ruleDestination = cells[4].innerHTML;
        const rulePort = cells[5].innerHTML;
        const ruleAction = cells[6].innerHTML;

        if (ruleChain === targetChain
            && (ruleProtocol === packet.transport_protocol || ruleProtocol === packet.protocol)
            && (ruleOrigin === "*" || ruleOrigin === packet.origin_ip)
            && (ruleDestination === "*" || ruleDestination === packet.destination_ip)
            && (rulePort === "*" || rulePort === packet.port)
        ) {

            if (ruleAction === "ACCEPT") {
                return true;
            }

            if (ruleAction === "DROP") {
                return false;
            }
        }

        i++;

    }

    // si no hay regla que coincida, se aplica la política por defecto
    return defaultPolicy === "ACCEPT";
}
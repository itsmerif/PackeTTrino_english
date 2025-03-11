class FirewallRule {
    constructor(chain, protocol, origin, destination, port, action) {
        this.chain = chain;
        this.protocol = protocol;
        this.origin = origin;
        this.destination = destination;
        this.port = port;
        this.action = action;
    }
}

function addFirewallRule(routerObjectId, newRule) {
    const $networkObject = document.getElementById(routerObjectId);
    const ruleTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rows = ruleTable.querySelectorAll("tr");
    let ruleId = rows.length;
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <tr>
            <td>${ruleId}</td>
            <td>${newRule.chain}</td>
            <td>${newRule.protocol}</td>
            <td>${newRule.origin}</td>
            <td>${newRule.destination}</td>
            <td>${newRule.port}</td>
            <td>${newRule.action}</td>
        </tr>`;
    ruleTable.appendChild(newRow);
    terminalMessage("Comando firewall ejecutado correctamente");
}

function deleteFirewallRule(routerObjectId, ruleId) {
    const $networkObject = document.getElementById(routerObjectId);
    const ruleTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rows = ruleTable.querySelectorAll("tr");
    rows[ruleId].remove();
    terminalMessage("Comando firewall ejecutado correctamente");
}

function showFirewallRules(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicy = $networkObject.getAttribute("firewall-default-policy");
    const firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    terminalMessage(`Firewall Default Policy: ${defaultPolicy}`);
    terminalMessage(`${firewallTable.outerHTML}`);
}
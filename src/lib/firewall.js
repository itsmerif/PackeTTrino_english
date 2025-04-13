class iptablesRule {
    constructor() {
        this.chain = "";
        this.p = "*";
        this.s = "*";
        this.d = "*";
        this.sport = "*";
        this.dport = "*";
        this.j = "";
    }
}

function isValidFirewallRule(rule) {

    const validChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validProtocols = ["tcp", "udp", "icmp"];
    const validActions = ["ACCEPT", "DROP", "REJECT"];

    if (rule.chain === "") {
        throw new Error("Error: falta la cadena [-A, -D]");
    }

    if (!validChains.includes(rule.chain)) { 
        throw new Error("Error: cadena no reconocida"); 
    }

    if (rule.p !== "*" && !validProtocols.includes(rule.p)) { 
        throw new Error("Error: protocolo no reconocido"); 
    }

    if ( rule.s !== "*" && !isValidIp(rule.s)) {
        throw new Error("Error: ip de origen no válida"); 
    }

    if ( rule.d !== "*" && !isValidIp(rule.d)) {
        throw new Error("Error: ip de destino no válida"); 
    }

    if ( rule.sport !== "*" && !rule.sport.match(/^\d+$/)) { 
        throw new Error("Error: puerto de origen no válido");
    }

    if ( rule.dport !== "*" && !rule.dport.match(/^\d+$/)) { 
        throw new Error("Error: puerto de destino no válido"); 
    }

    if (rule.j === "") {
        throw new Error("Error: falta la acción [ACCEPT, DROP, REJECT]"); 
    }

    if (!validActions.includes(rule.j)) {
        throw new Error("Error: acción no reconocida");
    }

    return;

}

function addFirewallRule(routerObjectId, newRule) {
    const $networkObject = document.getElementById(routerObjectId);
    const ruleTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const numberOfRows = ruleTable.querySelectorAll("tr").length;
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <tr>
            <td>${numberOfRows}</td>
            <td>${newRule.chain}</td>
            <td>${newRule.p}</td>
            <td>${newRule.s}</td>
            <td>${newRule.d}</td>
            <td>${newRule.sport}</td>
            <td>${newRule.dport}</td>
            <td>${newRule.j}</td>
        </tr>`;
    ruleTable.appendChild(newRow);
    terminalMessage("Comando firewall ejecutado correctamente");
}

function deleteFirewallRule(routerObjectId, id) {
    const $networkObject = document.getElementById(routerObjectId);
    const ruleTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rows = ruleTable.querySelectorAll("tr");
    let found = false;
    let i = 1;

    while (!found && i < rows.length) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[0].innerHTML === id) {
            row.remove();
            found = true;
        }
        i++;
    }

    if (!found) {
        terminalMessage("Error: no se encontró la regla");
    } else {
        terminalMessage("Comando firewall ejecutado correctamente");
    }

}

function clearFirewall(networkObjectId, chain = "ALL") {
    const $networkObject = document.getElementById(networkObjectId);
    const firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const rows = firewallTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[1].innerHTML === chain || chain === "ALL") {
            row.remove();
        }
    }

    terminalMessage("Cortafuegos reestablecido correctamente.");
}

function showFirewallRules(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicy = $networkObject.getAttribute("firewall-default-policy");
    const firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    terminalMessage(`Firewall Default Policy: ${defaultPolicy}`);
    terminalMessage(`${firewallTable.outerHTML}`);
}
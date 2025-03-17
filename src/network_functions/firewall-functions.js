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

function iptables(networkObjectId, args) {

    const validChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validProtocols = ["tcp", "udp", "icmp"];
    const validActions = ["ACCEPT", "DROP", "REJECT"];

    let object = catchopts(
        ["A:", "p:", "s:", "d:", "-sport:", "-dport:", "j:"],
        args.slice(1).join(" ")
    );

    let rule = new iptablesRule();

    for (let option in object) {
        switch (option) {
            case "-A":
                if (!validChains.includes(object["-A"])) {terminalMessage("Error: cadena no reconocida"); return;}
                rule.chain = object["-A"]
                break;
            case "-p":
                if (!validProtocols.includes(object["-p"])) {terminalMessage("Error: protocolo no reconocida"); return;}
                rule.p = object["-p"]
                break;
            case "-s":
                if (!isValidIp(object["-s"])) {terminalMessage("Error: ip de origen no válida"); return;}
                rule.s = object["-s"]
                break;
            case "-d":
                if (!isValidIp(object["-d"])) {terminalMessage("Error: ip de destino no válida"); return;}
                rule.d = object["-d"]
                break;
            case "--sport":
                if (!object["--sport"].match(/^\d+$/)) {terminalMessage("Error: puerto de origen no válido"); return;}
                rule.sport = object["--sport"]
                break;
            case "--dport":
                if (!object["--dport"].match(/^\d+$/)) {terminalMessage("Error: puerto de destino no válido"); return;}
                rule.dport = object["--dport"]
                break;
            case "-j":
                if (!validActions.includes(object["-j"])) {terminalMessage("Error: acción no reconocida"); return;}
                rule.j = object["-j"]
                break;
        }
    }

    addFirewallRule(networkObjectId, rule);

}

function addFirewallRule(routerObjectId, newRule) {
    const $networkObject = document.getElementById(routerObjectId);
    const ruleTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <tr>
            <td>id</td>
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
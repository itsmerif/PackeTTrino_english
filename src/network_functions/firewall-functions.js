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
    let object;

    try {
        object = catchopts(
            ["A:", "D:", "p:", "s:", "d:", "-sport:", "-dport:", "j:", "S", "F:"],
            args.slice(1).join(" ")
        );
    } catch (error) {
        terminalMessage(`Error: Opción Ilegal. Consulta man iptables para más información.`);
        return;
    }

    let chainFlag = false;
    let actionFlag = false;
    let rule = new iptablesRule();

    for (let option in object) {
        switch (option) {
            case "-A":
                if (!validChains.includes(object["-A"])) { terminalMessage("Error: cadena no reconocida"); return; }
                chainFlag = true;
                rule.chain = object["-A"]
                break;
            case "-D":
                deleteFirewallRule(networkObjectId, object["-D"]);
                return;
            case "-S":
                showFirewallRules(networkObjectId);
                return;
            case "-F":
                clearFirewall(networkObjectId, object["-F"]);
                return;
            case "-p":
                if (!validProtocols.includes(object["-p"])) { terminalMessage("Error: protocolo no reconocida"); return; }
                rule.p = object["-p"]
                break;
            case "-s":
                if (!isValidIp(object["-s"])) { terminalMessage("Error: ip de origen no válida"); return; }
                rule.s = object["-s"]
                break;
            case "-d":
                if (!isValidIp(object["-d"])) { terminalMessage("Error: ip de destino no válida"); return; }
                rule.d = object["-d"]
                break;
            case "--sport":
                if (!object["--sport"].match(/^\d+$/)) { terminalMessage("Error: puerto de origen no válido"); return; }
                rule.sport = object["--sport"]
                break;
            case "--dport":
                if (!object["--dport"].match(/^\d+$/)) { terminalMessage("Error: puerto de destino no válido"); return; }
                rule.dport = object["--dport"]
                break;
            case "-j":
                if (!validActions.includes(object["-j"])) { terminalMessage("Error: acción no reconocida"); return; }
                actionFlag = true;
                rule.j = object["-j"]
                break;
        }
    }

    if (!chainFlag) { terminalMessage("Error: falta la cadena [-A, -D]"); return; }
    if (!actionFlag) { terminalMessage("Error: falta la acción [ACCEPT, DROP, REJECT]"); return; }

    addFirewallRule(networkObjectId, rule);

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
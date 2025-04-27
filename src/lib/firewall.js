/**ESTA CLASE REPRESENTA UNA REGLA DE IPTABLES */
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

/**ESTA FUNCION DEVUELVE LA POLÍTICA POR DEFECTO DEL FIREWALL DE UN DISPOSITIVO COMO OBJETO */
function getFirewallDefaultPolicy(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    return JSON.parse($networkObject.getAttribute("firewall-default-policy"));
}

/**ESTA FUNCION DEVUELVE LA TABLA DE REGLAS DE FIREWALL DE UN DISPOSITIVO COMO UN ARRAY DE STRINGS*/
function getFirewallTable(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $firewallTable = $networkObject.querySelector(".firewall-table").querySelector("table");
    const $firewallRules = $firewallTable.querySelectorAll("tr");
    let response = [];

    $firewallRules.forEach(rule => {
        const $fields = rule.querySelectorAll("td");
        if ($fields.length < 1) return;
        let chainString = ($fields[1].innerHTML !== "*") ? ` -A ${$fields[1].innerHTML}` : "";
        let protocolString = ($fields[2].innerHTML !== "*") ? ` -p ${$fields[2].innerHTML}` : "";
        let sourceString = ($fields[3].innerHTML !== "*") ? ` -s ${$fields[3].innerHTML}` : "";
        let destinationString = ($fields[4].innerHTML !== "*") ? ` -d ${$fields[4].innerHTML}` : "";
        let sourcePortString = ($fields[5].innerHTML !== "*") ? ` --sport ${$fields[5].innerHTML}` : "";
        let destinationPortString = ($fields[6].innerHTML !== "*") ? ` --dport ${$fields[6].innerHTML}` : "";
        let actionString = ($fields[7].innerHTML !== "*") ? ` -j ${$fields[7].innerHTML}` : "";
        response.push(`iptables ${chainString}${protocolString}${sourceString}${destinationString}${sourcePortString}${destinationPortString}${actionString}`);
    });

    return response;
}

/**ESTA FUNCION COMPUERA SI LA REGLA DE FIREWALL ES VALIDA */
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

/**ESTA FUNCION AÑADE UNA NUEVA REGLA DE FIREWALL */
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

}

/**ESTA FUNCION ELIMINA UNA REGLA DE FIREWALL */
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

}

/**ESTA FUNCION ELIMINA TODAS LAS REGLAS DE FIREWALL DE UN DISPOSITIVO */
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
}

/**ESTA FUNCION INTRODUCE UNA NUEVA POLÍTICA DE FIREWALL */
function setFirewallDefaultPolicy(networkObjectId, chain, action) {
    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicies = JSON.parse($networkObject.getAttribute("firewall-default-policy"));
    const validChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validActions = ["ACCEPT", "DROP", "REJECT"];
    if (!validChains.includes(chain)) throw new Error("iptables: Bad built-in chain name.");
    if (!validActions.includes(action)) throw new Error("iptables: Bad policy name.");
    defaultPolicies[chain] = action;
    $networkObject.setAttribute("firewall-default-policy", JSON.stringify(defaultPolicies));
}
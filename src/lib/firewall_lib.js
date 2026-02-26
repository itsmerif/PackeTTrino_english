/**ESTA CLASE REPRESENTA UNA REGLA DE IPTABLES */
class iptablesRule {
    constructor() {
        this.t = "filter"; //tabla
        this.A = ""; //cadena
        this.p = "*"; //protocolo
        this.s = "*"; //ip de origen
        this.d = "*"; //ip de destino
        this.i = "*"; //interfaz de entrada
        this.o = "*"; //interfaz de salida
        this.sport = "*"; //puerto de origen
        this.dport = "*"; //puerto de destino
        this.j = ""; //acción
        this.to__destination = ""; //destino
        this.to__source = ""; //origen
    }
}

/**ESTA FUNCION INTRODUCE UNA NUEVA POLÍTICA DE FIREWALL POR DEFECTO A UN DISPOSITIVO */
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

/**ESTA FUNCION DEVUELVE LA POLÍTICA POR DEFECTO DEL FIREWALL DE UN DISPOSITIVO COMO OBJETO */
function getFirewallDefaultPolicy(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    return JSON.parse($networkObject.getAttribute("firewall-default-policy"));
}

/**ESTA FUNCION DEVUELVE LAS REGLAS DE FIREWALL DE UN DISPOSITIVO COMO ARRAY DE STRINGS*/
function getFirewallTable(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    let response = [];
    for (let table in firewallRules) {
        const rules = firewallRules[table];
        rules.forEach(rule => {
            let ruleString = "";
            for (let key in rule) if (rule[key] !== "*" && rule[key] !== "") ruleString += `-${key} ${rule[key]} `;
            response.push(ruleString);
        });
    }
    return response;
}

/**ESTA FUNCION COMPUERA SI LA REGLA DE FIREWALL ES VALIDA */
function isValidFirewallRule(rule, networkObjectId) {

    const validTables = ["filter", "nat"];
    const validFilterChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validProtocols = ["tcp", "udp", "icmp"];
    const validFilterActions = ["ACCEPT", "DROP", "REJECT"];
    const validNATActions = ["DNAT", "SNAT", "MASQUERADE"];
    const validInterfaces = getInterfaces(networkObjectId);

    if (!validTables.includes(rule.t)) throw new Error(`Error: table ${rule.t} not recognized`);

    if (rule.t === "filter") {

        if (!validFilterChains.includes(rule.A)) throw new Error(`Error: String ${rule.A} not allowed.`);

        if (!validFilterActions.includes(rule.j)) throw new Error(`Error: Action ${rule.j} not allowed.`);

    }

    if (rule.t === "nat") {

        if (!validNATActions.includes(rule.j)) throw new Error(`Error: Action ${rule.j} not allowed.`);

        if (rule.j === "DNAT") {
            if (rule.A !== "PREROUTING") throw new Error(`Error: String ${rule.A} not allowed with DNAT.`);
            if (!isValidIp(rule.to__destination)) throw new Error(`Error: Destination ${rule.to__destination} not allowed for DNAT.`);
        }

        if (rule.j === "SNAT") {
            if (rule.A !== "POSTROUTING") throw new Error(`Error: String ${rule.A} not allowed with SNAT.`);
            if (!isValidIp(rule.to__source)) throw new Error(`Error: Source ${rule.to__source} not allowed for SNAT.`);
        }

    }

    if (rule.p !== "*" && !validProtocols.includes(rule.p)) throw new Error(`Error: Protocol ${rule.p} not recognized`); 

    if (rule.i !== "*" && !validInterfaces.includes(rule.i)) throw new Error(`Error: Unrecognized interface ${rule.i}`);

    if (rule.s !== "*" && !isValidIp(rule.s) && !isValidCidrIp(rule.s)) throw new Error("Error: Invalid source IP address"); 

    if (rule.d !== "*" && !isValidIp(rule.d) && !isValidCidrIp(rule.d)) throw new Error("Error: Invalid destination IP address"); 

    if (rule.sport !== "*" && !rule.sport.match(/^\d+$/)) throw new Error("Error: Invalid source port");

    if (rule.dport !== "*" && !rule.dport.match(/^\d+$/)) throw new Error("Error: Invalid destination port"); 

}

/**ESTA FUNCION AÑADE UNA NUEVA REGLA DE FIREWALL */
function addFirewallRule(routerObjectId, newRule) {
    const $networkObject = document.getElementById(routerObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules")); //array de reglas
    const table = (newRule.t).toUpperCase();
    firewallRules[table].push(newRule);
    $networkObject.setAttribute("firewall-rules", JSON.stringify(firewallRules));
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
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules")); //firewallRules object
    for (let table in firewallRules) {
        const rules = firewallRules[table]; //array of rule objects
        rules.forEach(rule => { //rule object
            if (chain === "ALL" || rule.A === chain) rules.splice(rules.indexOf(rule), 1);
        });
    }
    $networkObject.setAttribute("firewall-rules", JSON.stringify(firewallRules));
}

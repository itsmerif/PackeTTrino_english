function command_firewall(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const validChains = ["INPUT", "OUTPUT", "FORWARD"];
    const validProtocols = ["tcp", "udp", "icmp"];
    const validActions = ["ACCEPT", "DROP", "REJECT"];
    const validPolicies = ["ACCEPT", "DROP"];

    if (args[1] === "add") {

        //comando -> firewall add -A <chain> -p <protocol> --dport <port> -s <origin> -d <destination> -j <action>
        //               0     1   2    3     4     5          6      7    8    9      10     11       12     13

        //evaluacion de claves

        if (args.length !== 14) {
            terminalMessage("Error: Sintaxis: firewall add -A <chain> -p <protocol> --dport <port> -s <origin> -d <destination>  -j <action>");
            return;
        }

        if (args[2] !== "-A" || args[4] !== "-p" || args[6] !== "--dport" || args[8] !== "-s" || args[10] !== "-d" || args[12] !== "-j") {
            terminalMessage("Error: Sintaxis: firewall add -A <chain> -p <protocol> --dport <port> -s <origin> -d <destination> -j <action>");
            return;
        }

        //evaluacion de valores obligatorios

        if (!validChains.includes(args[3])) {
            terminalMessage("Error: La cadena introducida no es válida.");
            return;
        }

        if (!validProtocols.includes(args[5])) {
            terminalMessage("Error: El protocolo introducido no es válido.");
            return;
        }

        if (!validActions.includes(args[13])) {
            terminalMessage("Error: La acción introducida no es válida.");
            return;
        }

        //evaluacion de valores opcionales

        if (!args[7].match(/^\d+$/) && args[7] !== "*") {
            terminalMessage("Error: El puerto introducido no es válido.");
            return;
        }

        if (!args[9].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/) && args[9] !== "*") {
            terminalMessage("Error: La IP de origen introducida no es válida.");
            return;
        }

        if (!args[11].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/) && args[11] !== "*") {
            terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }

        //creamos la regla

        let chain = args[3];
        let protocol = args[5];
        let port = args[7];
        let origin = args[9];
        let destination = args[11];
        let action = args[13];

        let newRule = new FirewallRule(chain, protocol, origin, destination, port, action);
        addFirewallRule(networkObjectId, newRule);
    }

    if (args[1] === "del") {

        //comando -> firewall del <ruleId>

        //evaluacion de claves

        if (args.length !== 3) {
            terminalMessage("Error: Sintaxis: firewall del <ruleId>");
            return;
        }

        if (!args[2].match(/^\d+$/)) {
            terminalMessage("Error: El id introducido no es válido.");
            return;
        }
        
        deleteFirewallRule(networkObjectId, args[2]);
    }

    if (args[1] === "default") {

        if (args.length !== 3) {
            terminalMessage("Error: Sintaxis: firewall default <policy>");
            return;
        }

        if (!validPolicies.includes(args[2])) {
            terminalMessage("Error: La política introducida no es válida.");
            return;
        }

        $networkObject.setAttribute("firewall-default-policy", args[2]);
        terminalMessage("Comando firewall ejecutado correctamente");
        
    }

    if (args[1] === "-n") {
        showFirewallRules(networkObjectId);
        return;
    }
}
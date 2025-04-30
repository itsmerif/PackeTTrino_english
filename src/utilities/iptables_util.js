function command_Iptables(networkObjectId, args) {

    if (args[1] === "-S") {
        let defaultPolicies = getFirewallDefaultPolicy(networkObjectId);
        let firewallRules = getFirewallTable(networkObjectId);
        for (let policy in defaultPolicies) terminalMessage(`-P ${policy} ${defaultPolicies[policy]}`, networkObjectId);
        firewallRules.forEach(rule => terminalMessage(rule, networkObjectId));
        return;
    }

    if (args[1] === "-P") { 

        try {
            setFirewallDefaultPolicy(networkObjectId, args[2], args[3]);
        } catch (error) {
            terminalMessage(error.message, networkObjectId);
        }

        return;
    }

    if (args[1] === "-F") {
        clearFirewall(networkObjectId, args[2]);
        return;
    }

    if (args[1] === "-D") {
        deleteFirewallRule(networkObjectId, args[2]);
        terminalMessage("Se ha eliminado la regla correctamente.", networkObjectId);
        return;
    }

    let rule = new iptablesRule();

    let $OPTS = catchopts([
        "-A:", //cadena
        "-p:", //protocol
        "-s:", //ip de origen
        "-d:", //ip de destino
        "--sport:", //puerto de origen
        "--dport:", //puerto de destino
        "-j:"], //accion
    args);

    let optionHandlers = {
        "-A": () => rule.chain = $OPTS["-A"],
        "-p": () => rule.p = $OPTS["-p"],
        "-s": () => rule.s = $OPTS["-s"],
        "-d": () => rule.d = $OPTS["-d"],
        "--sport": () => rule.sport = $OPTS["--sport"],
        "--dport": () => rule.dport = $OPTS["--dport"],
        "-j": () => rule.j = $OPTS["-j"]
    }

    for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

    try {
        isValidFirewallRule(rule);
        addFirewallRule(networkObjectId, rule);
    } catch (error) {
        terminalMessage(error.message, networkObjectId);
    }

}
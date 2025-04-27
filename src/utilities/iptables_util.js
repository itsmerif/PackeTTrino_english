function command_Iptables(networkObjectId, args) {

    if (args[1] === "-S") {
        let defaultPolicies = getFirewallDefaultPolicy(networkObjectId);
        let firewallRules = getFirewallTable(networkObjectId);
        terminalMessage(`-P INPUT ${defaultPolicies["INPUT"]}`, networkObjectId);
        terminalMessage(`-P OUTPUT ${defaultPolicies["OUTPUT"]}`, networkObjectId);
        terminalMessage(`-P FORWARD ${defaultPolicies["FORWARD"]}`, networkObjectId);
        firewallRules.forEach(rule => terminalMessage(rule, networkObjectId));
        return;
    }

    if (args[1] === "-P") { // iptables -P [INPUT|OUTPUT|FORWARD] [ACCEPT|DROP|REJECT]

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
    let $OPTS = catchopts(["-A:", "-p:", "-s:", "-d:", "--sport:", "--dport:", "-j:"], args);

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
        terminalMessage("Se ha añadido la regla correctamente.", networkObjectId);
    } catch (error) {
        terminalMessage(error.message, networkObjectId);
    }

}
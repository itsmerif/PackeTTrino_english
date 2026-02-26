function command_Iptables(networkObjectId, args) {

    if (args[1] === "-S") {
        let defaultPolicies = getFirewallDefaultPolicy(networkObjectId);
        let firewallRules = getFirewallTable(networkObjectId);
        for (let policy in defaultPolicies) terminalMessage(`-P ${policy} ${defaultPolicies[policy]}`, networkObjectId);
        firewallRules.forEach(rule => terminalMessage(rule.replace(/_/g, "-"), networkObjectId));
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
        terminalMessage("The rule was successfully removed.", networkObjectId);
        return;
    }

    let rule = new iptablesRule();

    let $OPTS = catchopts([
        "-t:", //tabla
        "-A:", //cadena
        "-p:", //protocol
        "-i:", //interfaz de entrada
        "-o:", //interfaz de salida
        "-s:", //ip de origen
        "-d:", //ip de destino
        "--sport:", //puerto de origen
        "--dport:", //puerto de destino
        "-j:", //salto
        "--to-destination:", //salto a ip destino
        "--to-source:"], //salto a ip origen
    args);

    let optionHandlers = {
        "-t": () => rule.t = $OPTS["-t"],
        "-A": () => rule.A = $OPTS["-A"],
        "-p": () => rule.p = $OPTS["-p"],
        "-i": () => rule.i = $OPTS["-i"],
        "-o": () => rule.o = $OPTS["-o"],
        "-s": () => rule.s = $OPTS["-s"],
        "-d": () => rule.d = $OPTS["-d"],
        "--sport": () => rule.sport = $OPTS["--sport"],
        "--dport": () => rule.dport = $OPTS["--dport"],
        "-j": () => rule.j = $OPTS["-j"],
        "--to-destination": () => rule.to__destination = $OPTS["--to-destination"],
        "--to-source": () => rule.to__source = $OPTS["--to-source"]
    }
   
    for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

    try {
        isValidFirewallRule(rule, networkObjectId);
        addFirewallRule(networkObjectId, rule);
    } catch (error) {
        terminalMessage(error.message, networkObjectId);
    }

}

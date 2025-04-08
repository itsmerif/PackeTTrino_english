function command_Iptables(networkObjectId, args) {

    let rule = new iptablesRule();
    let $OPTS = catchopts(["-A:", "-D:", "-p:", "-s:", "-d:", "--sport:", "--dport:", "-j:", "-S", "-F:"], args);

    let optionActions = {
        "-A": () => rule.chain = $OPTS["-A"],
        "-D": () => deleteFirewallRule(networkObjectId, $OPTS["-D"]),
        "-S": () => showFirewallRules(networkObjectId),
        "-F": () => clearFirewall(networkObjectId, $OPTS["-F"]),
        "-p": () => rule.p = $OPTS["-p"],
        "-s": () => rule.s = $OPTS["-s"],
        "-d": () => rule.d = $OPTS["-d"],
        "--sport": () => rule.sport = $OPTS["--sport"],
        "--dport": () => rule.dport = $OPTS["--dport"],
        "-j": () => rule.j = $OPTS["-j"]
    }

    for (option in $OPTS) {
        optionActions[option]();
    }

    try {

        isValidFirewallRule(rule);
        addFirewallRule(networkObjectId, rule);

    } catch (error) {

        terminalMessage(error.message);
        console.log(error);
        return;

    }

}
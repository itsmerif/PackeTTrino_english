function command_arp(networkObjectId, args) {

    if (args[1] === "-a") {
        let arpTable = getcurrentARPTable(networkObjectId);
        terminalMessage(arpTable, networkObjectId);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {
        clearARPTable(networkObjectId)
        terminalMessage("The ARP table was successfully cleaned.", networkObjectId);
        return;
    }

    terminalMessage("Error: Syntax: arp &lt;-n&gt; ", networkObjectId);

}

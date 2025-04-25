function command_arp(networkObjectId, args) {

    if (args[1] === "-a") {
        let arpTable = getcurrentARPTable(networkObjectId);
        terminalMessage(arpTable, networkObjectId);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {
        clearARPTable(networkObjectId)
        terminalMessage("La tabla ARP ha sido limpiada correctamente.", networkObjectId);
        return;
    }

    terminalMessage("Error: Sintaxis: arp &lt;-n&gt; ", networkObjectId);

}
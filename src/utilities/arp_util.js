function command_arp(dataId, args) {

    const $networkObject = document.getElementById(dataId);

    if (args[1] === "-s" || args[1] === "--show") {
        terminalMessage($networkObject.querySelector(".arp-table").querySelector("table").outerHTML);
        return;
    }

    if (args[1] === "-f" || args[1] === "--flush") {
        $networkObject.querySelector(".arp-table").querySelector("table").innerHTML = `
                <tr>
                    <th>IP Address</th>
                    <th>MAC Address</th>
                </tr>`;
        terminalMessage("La tabla ARP ha sido limpiada correctamente.");
        return;
    }

    terminalMessage("Error: Sintaxis: arp &lt;-n&gt; ");

}
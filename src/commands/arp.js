function command_arp(dataId, args) {

    const $networkObject = document.getElementById(dataId);

    if (args[1] === "-n") {
        terminalMessage($networkObject.querySelector(".arp-table").querySelector("table").outerHTML);
        return;
    }

    terminalMessage("Error: Sintaxis: arp &lt;-n&gt; ");

}
async function command_ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping  &lt;ip | dominio&gt;");
        return;
    }

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("ping: connect: La red es inaccesible.");
        return;
    }

    await ping(dataId, args);

}

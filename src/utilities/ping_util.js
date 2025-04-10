async function command_ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

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

async function command_traceroute(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);

    let destination;
    let useNumeric = false;

    if (!networkObjectIp || !networkObjectNetmask) {
        terminalMessage("traceroute: Network configuration failed.", networkObjectId);
        return;
    }

    if (args.length === 1) {

        destination = args[0];

    }else if (args.length === 2 && args[0] === "-n") {

        destination = args[1];
        useNumeric = true;
        
    }else  {

        terminalMessage("Error: Syntaxt: traceroute [-n] destination", networkObjectId);
        return;

    }

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

        await traceroute(networkObjectId, destination, useNumeric);

    if (visualToggle) await maximizeTerminal();

}

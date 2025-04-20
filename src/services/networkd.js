function configureInterface(networkObjectId, ip, netmask, interface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + interface, ip); 
    $networkObject.setAttribute("netmask-" + interface, netmask);
}

function deconfigureInterface(networkObjectId, interface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + interface, "");
    $networkObject.setAttribute("netmask-" + interface, "");
}

function showObjectInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);
    terminalMessage("1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000", networkObjectId);
    terminalMessage("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00", networkObjectId);
    terminalMessage("    inet 127.0.0.1/8 scope host lo", networkObjectId);
    interfaces.forEach((interface, i) => {
        const ip = $networkObject.getAttribute("ip-" + interface);
        const netmask = $networkObject.getAttribute("netmask-" + interface);
        const mac = $networkObject.getAttribute("mac-" + interface);
        terminalMessage(`${i + 1}: ${interface}: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;  mtu 1500 qdisc fq_codel state UP group default qlen 1000`, networkObjectId);
        terminalMessage(`    link/ether ${mac} brd ff:ff:ff:ff:ff:ff`, networkObjectId);
        if (ip) terminalMessage(`    inet ${ip}/${netmaskToCidr(netmask)} brd 192.168.1.255 scope global dynamic ${interface}`, networkObjectId);
    });
}
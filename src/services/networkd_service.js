/**ESTA FUNCION CONFIGURA UNA INTERFAZ DE UN EQUIPO */
function configureInterface(networkObjectId, ip, netmask, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + iface, ip); 
    $networkObject.setAttribute("netmask-" + iface, netmask);
    setDirectRoutingRule(networkObjectId, ip, netmask, iface);
}

/**ESTA FUNCION DESCONFIGURA UNA INTERFAZ DE UN EQUIPO */
function deconfigureInterface(networkObjectId, iface) {
    const $networkObject = document.getElementById(networkObjectId);
    $networkObject.setAttribute("ip-" + iface, "");
    $networkObject.setAttribute("netmask-" + iface, "");
    removeInterfaceRoutingRules(networkObjectId, iface);
}

/**ESTA FUNCION MUESTRA POR TERMINAL LA INFORMACION DE LAS INTERFACES DE UN EQUIPO */
function showNetworkObjectInfo(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const interfaces = getInterfaces(networkObjectId);

    let message = "1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt;\n";
    message += "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n";
    message += "    inet 127.0.0.1/8 scope host lo\n";

    interfaces.forEach((iface, i) => {
        const ip = $networkObject.getAttribute("ip-" + iface);
        const netmask = $networkObject.getAttribute("netmask-" + iface);
        const mac = $networkObject.getAttribute("mac-" + iface);
        message += `${i + 1}: ${iface}: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;\n`;
        message += `    link/ether ${mac} brd ff:ff:ff:ff:ff:ff\n`;
        if (ip) message += `    inet ${ip}/${netmaskToCidr(netmask)} brd ${getBroadcast(ip, netmask)} scope global dynamic ${iface}\n`;
    });

    terminalMessage(message, networkObjectId);

}
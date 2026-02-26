function PcObject(x, y) {

    const $networkObject = document.createElement("article");
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    $networkObject.id = `pc-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "pc");

    append(
        IconObject("pc.svg"),
        arpTable(),
        cacheDnsTable(),
        routingTable(),
        advancedOptionsObject("terminal", "arp", "cacheDns", "delete")
    );

    const filesystem = {
        "/": {
            "bin" : {},
            "boot" : {},
            "dev" : {},
            "etc": {
                "hosts": "127.0.0.1 localhost" ,
                "resolv.conf": "",
                "network": {
                    "interfaces": ""
                }
            },
            "home" : {},
            "var": {}
        }
    };

    //Add the basic attributes
    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("filesystem", JSON.stringify(filesystem));
    attr("ipv4-forwarding", "false");
    
    // Add the resolver
    attr("resolved", "true");

    // Install packages
    installDhclient($networkObject);
    installIptables($networkObject);
    installBrowser($networkObject);

    // Add events
    attr("onclick", "showPcMenu('" + $networkObject.id + "')");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("ondragstart", "BoardItemDragStart(event)");

    return $networkObject;

}

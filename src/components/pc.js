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
        firewallTable(),
        routingTable(),
        advancedOptionsObject("terminal", "arp", "cacheDns", "browser", "delete")
    );

    let filesystem = {
        "/": {
            "bin" : {},
            "boot" : {},
            "dev" : {},
            "etc": {
                "hosts": "{'127.0.0.1': ['localhost']}" ,
                "resolv.conf": "",
                "network": {
                    "interfaces": ""
                }
            },
            "home" : {},
            "var": {}
        }
    };

    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("data-gateway", "");
    attr("data-etc-hosts", `{ "127.0.0.1": ["localhost"] }`);
    attr("firewall-default-policy", "ACCEPT");
    attr("data-dns-server", "");
    attr("resolved", "true");
    attr("onclick", "showPcForm('" + $networkObject.id + "')");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("ondragstart", "BoardItemDragStart(event)");
    attr("filesystem", JSON.stringify(filesystem));
    installDhclient($networkObject);
    installApache2($networkObject);
    itemIndex++;
    return $networkObject;

}
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
        advancedOptionsObject("terminal", "arp", "cacheDns", "browser", "delete")
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

    //añadimos los atributos básicos
    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("data-gateway", "");
    attr("filesystem", JSON.stringify(filesystem));
    attr("data-dns-server", "");

    //añadimos el resolver
    attr("resolved", "true");

    //instalamos paquetes
    installDhclient($networkObject);
    installIptables($networkObject);

    //añadimos eventos
    attr("onclick", "showPcMenu('" + $networkObject.id + "')");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("ondragstart", "BoardItemDragStart(event)");


    itemIndex++;
    return $networkObject;

}

function RouterObject(x, y) {

    const $networkObject = document.createElement("article");
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    $networkObject.id = `router-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "router");

    append(
        IconObject("router.svg"),
        arpTable(),
        routingTable(),
        firewallTable(),
        advancedOptionsObject("terminal", "routing", "arp", "firewall", "delete")
    );

    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-switch-enp0s3", "");
    attr("ip-enp0s8", "");
    attr("netmask-enp0s8", "");
    attr("mac-enp0s8", getRandomMac());
    attr("data-switch-enp0s8", "");
    attr("ip-enp0s9", "");
    attr("netmask-enp0s9", "");
    attr("mac-enp0s9", getRandomMac());
    attr("data-switch-enp0s9", "");
    attr("firewall-default-policy", "ACCEPT");
    attr("ondragstart", "BoardItemDragStart(event)");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("onclick", "showRouterSpecs(event)");
             
    itemIndex++;

    return $networkObject;

}
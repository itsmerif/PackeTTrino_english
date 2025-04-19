function DnsServerObject(x, y) {

    const $networkObject = document.createElement("article");
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    $networkObject.id = `dns-server-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "dns-server");

    append(
        IconObject("dns.svg"),
        arpTable(),
        firewallTable(),
        advancedOptionsObject("terminal", "arp", "firewall", "delete")
    );

    attr("ip-enp0s3", "");
    attr("netmask-enp0s3", "");
    attr("mac-enp0s3", getRandomMac());
    attr("data-gateway", "");
    attr("data-switch-enp0s3", "");
    attr("firewall-default-policy", "ACCEPT");
    attr("ondragstart", "BoardItemDragStart(event)");
    attr("oncontextmenu", "showAdvancedOptions(event)");
    attr("onclick", "showDnsForm(event)");

    installBind9($networkObject);

    itemIndex++;

    return $networkObject;
    
}

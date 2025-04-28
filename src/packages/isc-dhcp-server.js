function installDhcpd(networkObjectId) {
    let $networkObject;
    terminalMessage("Instalando DHCP Server...", networkObjectId);
    if (typeof networkObjectId === "string") $networkObject = document.getElementById(networkObjectId);
    if (networkObjectId instanceof Node) $networkObject = networkObjectId;
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));
    append(dhcpTable());
    attr("dhcpd", "true");
    attr("data-range-start", "");
    attr("data-range-end", "");
    attr("offer-gateway", "");
    attr("offer-netmask", "");
    attr("offer-dns", "");
    attr("offer-lease-time", "");
    attr("data-interval", "false");
    attr("ip-reservations", `{}`);
    addOption(leasesTableOptionButton(), dhcpServerConfig());
    terminalMessage("DHCP Server instalado correctamente.", networkObjectId);
}

function uninstallDhcpd(networkObjectId) {

    if (networkObjectId.startsWith("dhcp-server-")) throw new Error("Error: no se puede desinstalar isc-dhcp-server en este dispositivo.", networkObjectId);

    terminalMessage("Desinstalando DHCP Server...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dhcpTable = $networkObject.querySelector(".dhcp-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    rattr("dhcpd", "data-range-start", "data-range-end", "offer-gateway", "offer-netmask", "offer-dns", "offer-lease-time", "data-interval");
    remOption("dhcp-option", "dhcp-server-config");
    remove($dhcpTable);

    terminalMessage("DHCP Server desinstalado correctamente.", networkObjectId);

} 
function installDhclient(networkObjectId) {
    let $networkObject;
    terminalMessage("Instalando DHCP Client...", networkObjectId);
    if (typeof networkObjectId === "string") $networkObject = document.getElementById(networkObjectId);
    if (networkObjectId instanceof Node) $networkObject = networkObjectId;

    if ($networkObject.id.startsWith("router-")) throw new Error("Error: En esta versión no se puede instalar el paquete DHCP Client en un router.");

    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);       
    attr("dhclient", "false");   
    attr("data-dhcp-server", "");
    attr("data-dhcp-lease-time", "");
    attr("data-dhcp-current-lease-time", "");
    attr("data-dhcp-flag-t1", "false");
    attr("data-dhcp-flag-t2", "false");
    terminalMessage("DHCP Client instalado correctamente.", networkObjectId);
}

function uninstallDhclient(networkObjectId) {

    terminalMessage("Desinstalando DHCP Client...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));

    rattr(
        "dhclient",
        "data-dhcp-server",
        "data-dhcp-lease-time",
        "data-dhcp-current-lease-time",
        "data-dhcp-flag-t1",
        "data-dhcp-flag-t2"
    );
    
    terminalMessage("DHCP Client desinstalado correctamente.", networkObjectId);

}
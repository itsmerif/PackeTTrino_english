function installDhclient($networkObject) {

    const networkObjectId = $networkObject.id;
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    if (networkObjectId.startsWith("router-")) throw new Error("Error: En esta versión no se puede instalar el paquete DHCP Client en un router.");

    terminalMessage("Instalando DHCP Client...", networkObjectId);
          
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
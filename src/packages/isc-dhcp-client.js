function installDhclient(networkObjectId) {

    terminalMessage("Instalando DHCP Client...");

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));           

    attr("dhclient", "false");   
    attr("data-dhcp-server", "");
    attr("data-dhcp-lease-time", "");
    attr("data-dhcp-current-lease-time", "");

    terminalMessage("DHCP Client instalado correctamente.");

}

function uninstallDhclient(networkObjectId) {

    terminalMessage("Desinstalando DHCP Client...");

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));

    rattr("dhclient", "data-dhcp-server", "data-dhcp-lease-time", "data-dhcp-current-lease-time");
    //TODO -> eliminar los setIntervals asociado con este objeto
    
    terminalMessage("DHCP Client desinstalado correctamente.");

}
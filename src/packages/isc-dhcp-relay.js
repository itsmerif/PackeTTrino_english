function installDhcprelay(networkObjectId) {

    terminalMessage("Instalando DHCP Relay...");

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    attr("dhcrelay", "true");
    attr("data-main-server", "");

    terminalMessage("DHCP Relay instalado correctamente.");
}

function uninstallDhcprelay(networkObjectId) {

    terminalMessage("Desinstalando DHCP Relay...");

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    rattr("dhcrelay", "data-main-server");

    terminalMessage("DHCP Relay desinstalado correctamente.");
}
function installDhcprelay(networkObjectId) {

    terminalMessage("Instalando DHCP Relay...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    attr("dhcrelay", "true");
    attr("data-main-server", "");
    addOption(dhcpRelayConfig());

    terminalMessage("DHCP Relay instalado correctamente.", networkObjectId);

    return "Se instaló DHCP Relay correctamente.";
}

function uninstallDhcprelay(networkObjectId) {

    if (networkObjectId.startsWith("dhcp-relay-server-")) {
        terminalMessage("Error: No se puede desinstalar isc-dhcp-relay en este dispositivo.", networkObjectId);
        return;
    }

    terminalMessage("Desinstalando DHCP Relay...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    rattr("dhcrelay", "data-main-server");
    remOption("dhcp-relay-option");

    terminalMessage("DHCP Relay desinstalado correctamente.", networkObjectId);

    return "Se desinstaló DHCP Relay correctamente.";
}
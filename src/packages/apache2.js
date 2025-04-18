function installApache2(networkObjectId) {

    terminalMessage("Instalando Apache...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    attr("apache", "true");
    attr("web-content", "");

    terminalMessage("Apache instalado correctamente.", networkObjectId);

    return "Se instaló Apache correctamente.";
}

function uninstallApache2(networkObjectId) {

    terminalMessage("Desinstalando Apache...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    rattr("apache", "web-content");

    terminalMessage("Apache desinstalado correctamente.", networkObjectId);

    return "Se desinstaló Apache correctamente.";

}
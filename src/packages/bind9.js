function installBind9(networkObjectId) {

    terminalMessage("Instalando Bind...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    append(dnsTable());
    attr("named", "true");
    attr("recursion", "false");
    addOption(dnsOptionButton());

    terminalMessage("Bind instalado correctamente.", networkObjectId);
}

function uninstallBind9(networkObjectId) {

    if (networkObjectId.startsWith("dns-server-")) {
        terminalMessage("Error: No se puede desinstalar Bind en este dispositivo.", networkObjectId);
        return;
    }

    terminalMessage("Desinstalando Bind...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dnsTable = $networkObject.querySelector(".dns-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    remove($dnsTable);
    rattr("named","recursion");
    remOption("dns-option");   

    terminalMessage("Bind desinstalado correctamente.", networkObjectId);
}
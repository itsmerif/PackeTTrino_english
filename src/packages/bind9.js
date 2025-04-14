function installBind9(networkObjectId) {

    terminalMessage("Instalando Bind...");

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (html) => $advancedOptions.innerHTML += html;

    append(dnsTable());
    attr("named", "true");
    attr("recursion", "false");
    addOption(`<button id="dns-option" onclick="showObjectModalTable(event, '.dns-table')">Ver Registros DNS</button>`);

    terminalMessage("Bind instalado correctamente.");
}

function uninstallBind9(networkObjectId) {

    terminalMessage("Desinstalando Bind...");

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dnsTable = $networkObject.querySelector(".dns-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    remove($dnsTable);
    rattr("named","recursion");
    remOption("dns-option");   

    terminalMessage("Bind desinstalado correctamente.");
}
function installBind9($networkObject) {

    terminalMessage("Instalando Bind...", $networkObject.id);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    append(
        dnsTable(),
        cacheDnsTable()
    );

    attr("named", "true");
    attr("recursion", "false");
    attr("resolved", "false");
    addOption(dnsRecordsOptionButton(), dnsServerConfig(), cacheDnsOptionButton());

    terminalMessage("Bind instalado correctamente.", $networkObject.id);

}

function uninstallBind9(networkObjectId) {

    terminalMessage("Desinstalando Bind...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dnsTable = $networkObject.querySelector(".dns-table");
    const $cacheDnsTable = $networkObject.querySelector(".cache-dns-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    remove($dnsTable, $cacheDnsTable);
    rattr("named","recursion", "resolved");
    remOption("dns-option");
    remOption("dns-server-config");
    remOption("cache-dns-option");
    
    terminalMessage("Bind desinstalado correctamente.", networkObjectId);
}
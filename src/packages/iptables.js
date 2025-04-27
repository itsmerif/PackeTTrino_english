function installIptables($networkObject) {

    let networkObjectId = $networkObject.id;
    
    terminalMessage("Instalando Iptables...", networkObjectId);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");

    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));

    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    let defaultPolicies = {
        "INPUT": "ACCEPT",
        "OUTPUT": "ACCEPT",
        "FORWARD": "ACCEPT"
    }

    attr("firewall-default-policy", JSON.stringify(defaultPolicies));

    terminalMessage("Apache instalado correctamente.", networkObjectId);
    
}
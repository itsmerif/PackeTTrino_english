function installIptables($networkObject) {

    const networkObjectId = $networkObject.id;
    
    terminalMessage("Installing ipTables...", networkObjectId);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    let defaultPolicies = {
        "INPUT": "ACCEPT",
        "OUTPUT": "ACCEPT",
        "FORWARD": "ACCEPT"
    }

    let firewallRules = {
        "FILTER": [],
        "NAT": []
    }

    attr("firewall-default-policy", JSON.stringify(defaultPolicies));
    attr("firewall-rules", JSON.stringify(firewallRules));

    terminalMessage("Apache successfully installed.", networkObjectId);
    
}

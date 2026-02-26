function installBrowser($networkObject) {

    terminalMessage("Installing Amin™ Search Browser...", $networkObject.id);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    //atributos de apache

    attr("browser", "true");

    addOption(browserOptionButton());

    terminalMessage("Amin™ Search Browser successfully installed.", $networkObject.id);
    
}


function uninstallBrowser(networkObjectId) {

    terminalMessage("Uninstalling Amin™ Search Browser...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    //atributos de apache
    rattr("browser");

    //se eliminan opciones de la opciones avanzadas
    remOption("browser-option");

    terminalMessage("Amin™ Search Browser successfully uninstalled.", networkObjectId);
}

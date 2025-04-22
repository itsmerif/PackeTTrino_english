function installApache2(networkObjectId) {
    let $networkObject;
    terminalMessage("Instalando Apache...", networkObjectId);
    if (typeof networkObjectId === "string") $networkObject = document.getElementById(networkObjectId);
    if (networkObjectId instanceof Node) $networkObject = networkObjectId;
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const fileSystem = new FileSystem($networkObject);
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));
    attr("apache", "true");
    attr("web-content", "");
    fileSystem.mkdir("html", ["var", "www"]);
    fileSystem.touch("index.html", ["var", "www", "html"]);
    terminalMessage("Apache instalado correctamente.", networkObjectId);
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

}
function installDhcprelay($networkObject) {

    const networkObjectId = $networkObject.id;

    terminalMessage("Instalando DHCP Relay...", networkObjectId);

    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));

    //atributos
    attr("dhcrelay", "true");
    attr("dhcrelay-main-server", "");
    attr("dhcrelay-listen-on-interfaces", "");
    addOption(dhcpRelayConfig());

    //directorios y archivos

    const iscDhcpRelayDefaultContent = `
    #Este archivo configura los servidores e interfaces disponibles para el servidor DHCP Relay
    SERVERS=""
    INTERFACES=""
    `;

    const networkObjectFileSystem = new FileSystem($networkObject);
    networkObjectFileSystem.mkdir("default", ["etc"]);
    networkObjectFileSystem.touch("isc-dhcp-relay", ["etc", "default"]);
    networkObjectFileSystem.write("isc-dhcp-relay", ["etc", "default"], iscDhcpRelayDefaultContent.split('\n').map(line => line.trimStart()).join('\n'));

    terminalMessage("DHCP Relay instalado correctamente.", networkObjectId);
}

function uninstallDhcprelay(networkObjectId) {

    terminalMessage("Desinstalando DHCP Relay...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());

    rattr("dhcrelay", "dhcrelay-main-server", "dhcrelay-listen-on-interfaces");
    remOption("dhcp-relay-config");

    //eliminar directorios y archivos
    const networkObjectFileSystem = new FileSystem($networkObject);
    networkObjectFileSystem.rmdir("default", ["etc"]);

    terminalMessage("DHCP Relay desinstalado correctamente.", networkObjectId);

}
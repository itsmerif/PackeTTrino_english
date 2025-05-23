function installDhcpd($networkObject) {

    const networkObjectId = $networkObject.id;
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const append = (...nodes) => nodes.forEach(node => $networkObject.appendChild(node));
    const addOption = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));
    const networkObjectFileSystem = new FileSystem($networkObject);

    terminalMessage("Instalando DHCP Server...", networkObjectId);

    //directorios y archivos
    networkObjectFileSystem.mkdir("dhcp", ["etc"]);
    networkObjectFileSystem.touch("dhcpd.conf", ["etc", "dhcp"]);
    networkObjectFileSystem.mkdir("default", ["etc"]);
    networkObjectFileSystem.touch("isc-dhcp-server", ["etc", "default"]);

    //atributos del servidor DHCP
    attr("dhcpd", "true");
    attr("dhcp-listen-on-interfaces", "");
    attr("data-interval", "false");

    //atributos del servicio DHCP
    attr("data-range-start", "");
    attr("data-range-end", "");
    attr("dhcp-offer-gateway", "");
    attr("dhcp-offer-netmask", "");
    attr("dhcp-offer-dns", "");  
    attr("dhcp-offer-lease-time", "");
    attr("dhcp-reservations", `{}`);

    addOption(leasesTableOptionButton(), dhcpServerConfig()); //<-- se añaden opciones a las opciones avanzadas
    append(dhcpTable()); //<-- se añade la tabla de DHCP

    terminalMessage("DHCP Server instalado correctamente.", networkObjectId);
}

function uninstallDhcpd(networkObjectId) {

    terminalMessage("Desinstalando DHCP Server...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $dhcpTable = $networkObject.querySelector(".dhcp-table");
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const remove = (...nodes) => nodes.forEach(node => $networkObject.removeChild(node));
    const remOption = (...options) => options.forEach(option => $advancedOptions.querySelector("#" + option).remove());
    const networkObjectFileSystem = new FileSystem($networkObject);

    //directorios y archivos
    networkObjectFileSystem.rmdir("dhcp", ["etc"]);
    networkObjectFileSystem.rmdir("default", ["etc"]);
    
    //atributos del servidor DHCP
    rattr(
        "dhcpd", 
        "data-range-start", 
        "data-range-end", 
        "dhcp-offer-gateway", 
        "dhcp-offer-netmask", 
        "dhcp-offer-dns", 
        "dhcp-offer-lease-time", 
        "data-interval",
        "dhcp-listen-on-interfaces"
    );

    //se eliminan opciones de la opciones avanzadas
    remOption("dhcp-option", "dhcp-server-config"); 
    remove($dhcpTable);

    //se elimina el timer de alquiler asociado al servidor DHCP
    clearInterval(serverLeaseTimers[networkObjectId]); 
    delete serverLeaseTimers[networkObjectId];

    terminalMessage("DHCP Server desinstalado correctamente.", networkObjectId);

} 
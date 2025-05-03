function advancedOptionsObject(...options) {

    const $advancedOptions = document.createElement("div");
    const append = (...nodes) => nodes.forEach(node => $advancedOptions.appendChild(node));
    $advancedOptions.classList.add("advanced-options-modal", "modal");
    $advancedOptions.setAttribute("onclick", "event.stopPropagation()");

    const availableButtons = {
        "terminal": () => terminalOptionButton(),
        "arp": () => arpOptionButton(),
        "cacheDns": () => cacheDnsOptionButton(),
        "browser": () => browserOptionButton(),
        "delete": () => deleteOptionButton(),
        "firewall": () => firewallTableOptionButton(),
        "routing": () => routingTableOptionButton(),
        "dhcp": () => leasesTableOptionButton(),
        "dns": () => dnsRecordsOptionButton(),
    }

    options.forEach(option => availableButtons[option] && append(availableButtons[option]()));

    return $advancedOptions;
    
}

function terminalOptionButton() {
    const $button = document.createElement("button");
    $button.id = "terminal-option";
    $button.innerHTML = "Modo Terminal";
    $button.setAttribute("onclick", "showTerminal(event)");
    return $button;
}

function arpOptionButton() {
    const $button = document.createElement("button");
    $button.id = "arp-option";
    $button.innerHTML = "Ver Tabla ARP";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.arp-table')");
    return $button;
}

function cacheDnsOptionButton() {
    const $button = document.createElement("button");
    $button.id = "cache-dns-option";
    $button.innerHTML = "Ver Caché DNS";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.cache-dns-table')");
    return $button;
}

function browserOptionButton() {
    const $button = document.createElement("button");
    $button.id = "browser-option";
    $button.innerHTML = "Navegador";
    $button.setAttribute("onclick", "openBrowser(event)");
    return $button;
}

function deleteOptionButton() {
    const $button = document.createElement("button");
    $button.id = "delete-option";
    $button.innerHTML = "Eliminar";
    $button.setAttribute("onclick", "deleteItem(event)");
    return $button;
}

function firewallTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "firewall-option";
    $button.innerHTML = "Ver Tabla Firewall";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.firewall-table')");
    return $button;
}

function routingTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "routing-option";
    $button.innerHTML = "Ver Tabla de Enrutamiento";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.routing-table')");
    return $button;
}

function leasesTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "dhcp-option";
    $button.innerHTML = "Ver Tabla de Alquileres";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.dhcp-table')");
    return $button;
}

function dnsRecordsOptionButton() {
    const $button = document.createElement("button");
    $button.id = "dns-option";
    $button.innerHTML = "Ver Tabla de Registros DNS";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.dns-table')");
    return $button;
}

function dhcpServerConfig() {
    const $button = document.createElement("button");
    $button.id = "dhcp-server-config";
    $button.innerHTML = "Configurar Servidor DHCP";
    $button.setAttribute("onclick", "showDhcpMenu(event)");
    return $button;
}

function dhcpRelayConfig() {
    const $button = document.createElement("button");
    $button.id = "dhcp-relay-config";
    $button.innerHTML = "Configurar Relay DHCP";
    $button.setAttribute("onclick", "showDhcpRelayMenu(event)");
    return $button;
}

function dnsServerConfig() {
    const $button = document.createElement("button");
    $button.id = "dns-server-config";
    $button.innerHTML = "Configurar Servidor DNS";
    $button.setAttribute("onclick", "showDnsForm(event)");
    return $button;
}
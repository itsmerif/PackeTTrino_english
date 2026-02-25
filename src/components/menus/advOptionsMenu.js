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
    $button.innerHTML = "Terminal";
    $button.setAttribute("onclick", "showTerminal(event)");
    return $button;
}

function arpOptionButton() {
    const $button = document.createElement("button");
    $button.id = "arp-option";
    $button.innerHTML = "See ARP Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.arp-table')");
    return $button;
}

function cacheDnsOptionButton() {
    const $button = document.createElement("button");
    $button.id = "cache-dns-option";
    $button.innerHTML = "View DNS Cache";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.cache-dns-table')");
    return $button;
}

function browserOptionButton() {
    const $button = document.createElement("button");
    $button.id = "browser-option";
    $button.innerHTML = "Browser";
    $button.setAttribute("onclick", "openBrowser(event)");
    return $button;
}

function deleteOptionButton() {
    const $button = document.createElement("button");
    $button.id = "delete-option";
    $button.innerHTML = "Delete";
    $button.setAttribute("onclick", "deleteItem(event)");
    return $button;
}

function firewallTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "firewall-option";
    $button.innerHTML = "View Firewall Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.firewall-table')");
    return $button;
}

function routingTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "routing-option";
    $button.innerHTML = "View Routing Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.routing-table')");
    return $button;
}

function leasesTableOptionButton() {
    const $button = document.createElement("button");
    $button.id = "dhcp-option";
    $button.innerHTML = "View Leases Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.dhcp-table')");
    return $button;
}

function dnsRecordsOptionButton() {
    const $button = document.createElement("button");
    $button.id = "dns-option";
    $button.innerHTML = "View DNS Records Table";
    $button.setAttribute("onclick", "showObjectModalTable(event, '.dns-table')");
    return $button;
}

function dhcpServerConfig() {
    const $button = document.createElement("button");
    $button.id = "dhcp-server-config";
    $button.innerHTML = "Configure DHCP Server";
    $button.setAttribute("onclick", "showDhcpMenu(event)");
    return $button;
}

function dhcpRelayConfig() {
    const $button = document.createElement("button");
    $button.id = "dhcp-relay-config";
    $button.innerHTML = "Configure DHCP Relay";
    $button.setAttribute("onclick", "showDhcpRelayMenu(event)");
    return $button;
}

function dnsServerConfig() {
    const $button = document.createElement("button");
    $button.id = "dns-server-config";
    $button.innerHTML = "Configure DNS Server";
    $button.setAttribute("onclick", "showDnsServerMenu(event)");
    return $button;
}

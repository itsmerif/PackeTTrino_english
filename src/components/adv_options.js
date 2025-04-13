function advancedOptionsObject(...options) {

    const $advancedOptions = document.createElement("div");
    const addOption = (html) => $advancedOptions.innerHTML += html;
    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.setAttribute("onclick", "event.stopPropagation()");

    const availableOptions = {
        "terminal": () => addOption(`<button onclick="showTerminal(event)">Modo Terminal</button>`),
        "arp": () => addOption(`<button onclick="showObjectModalTable(event, '.arp-table')">Ver Tabla ARP</button>`),
        "cacheDns": () => addOption(`<button onclick="showObjectModalTable(event, '.cache-dns-table')">Ver Caché DNS</button>`),
        "browser": () =>addOption(`<button onclick="openBrowser(event)">Navegador</button>`),
        "delete": () =>addOption(`<button onclick="deleteItem(event)">Eliminar</button>`),
        "firewall": () => addOption(`<button onclick="showObjectModalTable(event, '.firewall-table')">Ver Tabla Firewall</button>`),
        "routing": () => addOption(`<button onclick="showObjectModalTable(event, '.routing-table')">Ver Tabla de Enrutamiento</button>`),
        "dhcp": () => addOption(`<button onclick="showObjectModalTable(event, '.dhcp-table')"> Ver Tabla de Alquileres </button>`),
        "dns": () => addOption(`<button onclick="showObjectModalTable(event, '.dns-table')"> Ver Tabla de Registros DNS </button>`)
    }

    options.forEach(option => availableOptions[option] && availableOptions[option]());

    return $advancedOptions;
    
}
function PcObject(x, y) {

    const $board = document.querySelector(".board");
    const $networkObject = document.createElement("article");
    const $icon = document.createElement("img");
    const $arpTable = document.createElement("article");
    const $dnsTable = document.createElement("article");
    const $firewallTable = document.createElement("article");
    const $advancedOptions = document.createElement("div");

    //caracteristicas generales

    $networkObject.id = `pc-${itemIndex}`;
    [x, y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "pc");
    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("mac-enp0s3", getRandomMac());
    $networkObject.setAttribute("data-switch-enp0s3", "");
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-etc-hosts", `{ "127.0.0.1": ["localhost"] }`);
    $networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    $networkObject.setAttribute("dhclient", "false");
    $networkObject.setAttribute("apache", "false");
    $networkObject.setAttribute("resolved", "true");

    //atributos de servicios

    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("web-content", "");

    //icono

    $icon.src = "./assets/board/pc.svg";
    $icon.alt = "pc";
    $icon.draggable = true;

    //tabla arp

    $arpTable.classList.add("arp-table");
    $arpTable.innerHTML = `
        <table>
            <tr>
                <th>IP Address</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeARPTable(event)">Cerrar</button>
    `;

    $arpTable.setAttribute("onclick", "event.stopPropagation();");

    //tabla de registros dns

    $dnsTable.classList.add("dns-table");
    $dnsTable.innerHTML = `
                <table>
                    <tr>
                        <th>Domain</th>
                        <th>Type</th>
                        <th>Value</th>
                    </tr>
                </table>
                <button onclick="closeDnsTable(event)">Cerrar</button>
    `;

    $dnsTable.setAttribute("onclick", "event.stopPropagation();");

    //tabla de firewall

    $firewallTable.classList.add("firewall-table");
    $firewallTable.innerHTML = `
            <table>
                <tr>
                    <th>Id</th>
                    <th>Chain</th>
                    <th>Protocol</th>
                    <th>Origin IP</th>
                    <th>Destination IP</th>
                    <th>Port</th>
                    <th>Action</th>
                </tr>
            </table>
    `;

    //opciones avanzadas

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="showDnsTable(event)">Ver Caché DNS</button>
        <button onclick="scanNetwork(event)" style="display: none;">Escanear Redes Disponibles</button>
        <button onclick="openBrowser(event)">Navegador</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    //eventos

    $networkObject.setAttribute("onclick", "showPcForm('" + $networkObject.id + "')");
    $networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");

    //construimos el objeto

    $networkObject.appendChild($icon);
    $networkObject.appendChild($arpTable);
    $networkObject.appendChild($dnsTable);
    $networkObject.appendChild($firewallTable);
    $networkObject.appendChild($advancedOptions);
    itemIndex++;

    return $networkObject;

}
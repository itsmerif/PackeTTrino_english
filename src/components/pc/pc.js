function PcObject(x, y) {

    const $networkObject = document.createElement("article");
    const $icon = document.createElement("img");
    const $arpTable = arpTable();
    const $dnsTable = cacheDnsTable();
    const $firewallTable = firewallTable();
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

    //opciones avanzadas

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showObjectModalTable(event,'.arp-table')">Ver Tabla ARP</button>
        <button onclick="showObjectModalTable(event,'.cache-dns-table')">Ver Caché DNS</button>
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
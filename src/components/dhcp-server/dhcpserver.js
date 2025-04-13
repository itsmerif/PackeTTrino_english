function DhcpServerObject(x, y) {

    const $dhcpServerObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const $advancedOptions = document.createElement("div");
    const $networkObjectArpTable = arpTable();
    const $networkObjectDhcpTable = dhcpTable();
    const $firewallTable = firewallTable();

    //caracteristicas generales

    $dhcpServerObject.id = `dhcp-server-${itemIndex}`;
    $dhcpServerObject.classList.add("item-dropped", "dhcp-server");
    [x,y] = checkObjectClip(x, y);
    $dhcpServerObject.style.left = `${x}px`;
    $dhcpServerObject.style.top = `${y}px`;
    $dhcpServerObject.setAttribute("ip-enp0s3", "");
    $dhcpServerObject.setAttribute("netmask-enp0s3", "");
    $dhcpServerObject.setAttribute("mac-enp0s3", getRandomMac());
    $dhcpServerObject.setAttribute("data-gateway", "");
    $dhcpServerObject.setAttribute("data-switch-enp0s3", "");
    $dhcpServerObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    $dhcpServerObject.setAttribute("dhcpd", "true");

    //atributos de servicios

    $dhcpServerObject.setAttribute("data-range-start", "");
    $dhcpServerObject.setAttribute("data-range-end", "");
    $dhcpServerObject.setAttribute("offer-gateway", "");
    $dhcpServerObject.setAttribute("offer-netmask", "");
    $dhcpServerObject.setAttribute("offer-dns", "");
    $dhcpServerObject.setAttribute("offer-lease-time", "");
    $dhcpServerObject.setAttribute("data-interval", "false");

    //icono

    networkObjectIcon.src = "./assets/board/dhcp.svg";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    
    //opciones avanzadas

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showObjectModalTable(event, '.dhcp-table')"> Ver Tabla de Alquileres </button>
        <button onclick="showObjectModalTable(event, '.arp-table')">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    //construimos el objeto

    $dhcpServerObject.appendChild(networkObjectIcon);
    $dhcpServerObject.appendChild($advancedOptions);
    $dhcpServerObject.appendChild($networkObjectArpTable);
    $dhcpServerObject.appendChild($networkObjectDhcpTable);
    $dhcpServerObject.appendChild($firewallTable);

    //eventos

    $dhcpServerObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $dhcpServerObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $dhcpServerObject.setAttribute("onclick", "showDhcpSpecs(event)");
    $advancedOptions.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $dhcpServerObject;

}
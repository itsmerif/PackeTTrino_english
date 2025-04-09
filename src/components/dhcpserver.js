function DhcpServerObject(x, y) {

    const $dhcpServerObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const $advancedOptions = document.createElement("div");
    const $networkObjectArpTable = document.createElement("article");
    const $networkObjectDhcpTable = document.createElement("article");
    const $firewallTable = document.createElement("article");


    //caracteristicas generales

    $dhcpServerObject.id = `dhcp-server-${itemIndex}`;
    $dhcpServerObject.classList.add("item-dropped", "dhcp-server");
    [x,y] = checkObjectClip(x, y);
    $dhcpServerObject.style.left = `${x}px`;
    $dhcpServerObject.style.top = `${y}px`;
    $dhcpServerObject.setAttribute("ip-enp0s3", "");
    $dhcpServerObject.setAttribute("netmask-enp0s3", "");
    $dhcpServerObject.setAttribute("data-mac", getRandomMac());
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
    $dhcpServerObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showDhcpTable(event)"> Ver Tabla de Alquileres </button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    $dhcpServerObject.appendChild($advancedOptions);

    //tabla de arp

    $networkObjectArpTable.classList.add("arp-table");
    $networkObjectArpTable.innerHTML = `
        <table>
            <tr>
                <th>IP Address</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeARPTable(event)">Cerrar</button>`;
    
    $dhcpServerObject.appendChild($networkObjectArpTable);

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
            </table>`;

    $dhcpServerObject.appendChild($firewallTable);

    //tabla de alquileres

    $networkObjectDhcpTable.classList.add("dhcp-table");
    $networkObjectDhcpTable.innerHTML = `
                <table>
                    <tr>
                        <th>IP</th>
                        <th>MAC</th>
                        <th>Hostname</th>
                        <th>Lease Time</th>
                    </tr>
                </table>
                <button onclick="closeDhcpTable(event)">Cerrar</button>`;

    $dhcpServerObject.appendChild($networkObjectDhcpTable);

    //eventos

    $dhcpServerObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $dhcpServerObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $dhcpServerObject.setAttribute("onclick", "showDhcpSpecs(event)");
    $advancedOptions.setAttribute("onclick", "event.stopPropagation()");
    $networkObjectDhcpTable.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $dhcpServerObject;

}
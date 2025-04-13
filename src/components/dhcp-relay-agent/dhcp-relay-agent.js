function DhcpRelayObject(x, y) {

    const $dhcpAgentObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const firewallTable = document.createElement("article");

    //caracteristicas generales

    $dhcpAgentObject.id = `dhcp-relay-server-${itemIndex}`;
    $dhcpAgentObject.classList.add("item-dropped", "dhcp-relay");
    [x,y] = checkObjectClip(x, y);
    $dhcpAgentObject.style.left = `${x}px`;
    $dhcpAgentObject.style.top = `${y}px`;
    $dhcpAgentObject.setAttribute("ip-enp0s3", "");
    $dhcpAgentObject.setAttribute("netmask-enp0s3", "");
    $dhcpAgentObject.setAttribute("mac-enp0s3", getRandomMac());
    $dhcpAgentObject.setAttribute("data-gateway", "");
    $dhcpAgentObject.setAttribute("data-switch-enp0s3", "");
    $dhcpAgentObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    $dhcpAgentObject.setAttribute("dhcrelay", "true");

    //atributos de servicios

    $dhcpAgentObject.setAttribute("data-main-server", "");

    //icono

    networkObjectIcon.src = "./assets/board/dhcprelay.svg";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    $dhcpAgentObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showObjectModalTable(event, '.arp-table')">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    $dhcpAgentObject.appendChild(advancedOptions);

    //tabla de arp

    networkObjectArpTable.classList.add("arp-table");
    networkObjectArpTable.innerHTML = `
        <table>
            <tr>
                <th>IP Address</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.arp-table')">Cerrar</button>`;
    
    $dhcpAgentObject.appendChild(networkObjectArpTable);

    //tabla de firewall

    firewallTable.classList.add("firewall-table");
    firewallTable.innerHTML = `
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

    $dhcpAgentObject.appendChild(firewallTable);
    
    //eventos

    $dhcpAgentObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $dhcpAgentObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $dhcpAgentObject.setAttribute("onclick", "showDhcpRelaySpecs(event)");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $dhcpAgentObject;

}
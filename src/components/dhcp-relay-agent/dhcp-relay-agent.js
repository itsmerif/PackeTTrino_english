function DhcpRelayObject(x, y) {

    const $dhcpAgentObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = arpTable();
    const networkObjectFirewallTable = firewallTable();

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

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showObjectModalTable(event, '.arp-table')">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    $dhcpAgentObject.appendChild(advancedOptions);

    //construimos el objeto

    $dhcpAgentObject.appendChild(networkObjectIcon);
    $dhcpAgentObject.appendChild(advancedOptions);
    $dhcpAgentObject.appendChild(networkObjectArpTable);
    $dhcpAgentObject.appendChild(networkObjectFirewallTable);

    //eventos

    $dhcpAgentObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $dhcpAgentObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $dhcpAgentObject.setAttribute("onclick", "showDhcpRelaySpecs(event)");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $dhcpAgentObject;

}
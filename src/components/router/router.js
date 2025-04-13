function RouterObject(x, y) {

    const $networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectArpTable = arpTable();
    const networkObjectFirewallTable = firewallTable();
    const networkObjectRoutingTable = routingTable();
    const networkObjectAdvancedOptions = document.createElement("div");

    //características generales

    $networkObject.id = `router-${itemIndex}`;
    $networkObject.classList.add("item-dropped", "router");
    [x,y] = checkObjectClip(x, y); //comprobamos si el objeto queda clipeado fuera del tablero, y lo ajustamos
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //icono

    networkObjectIcon.src = "./assets/board/router.svg";
    networkObjectIcon.alt = "router";
    networkObjectIcon.draggable = true;

    //direcciones ip de cada interfaz del router

    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("mac-enp0s3", getRandomMac());
    $networkObject.setAttribute("data-switch-enp0s3", "");

    $networkObject.setAttribute("ip-enp0s8", "");
    $networkObject.setAttribute("netmask-enp0s8", "");
    $networkObject.setAttribute("mac-enp0s8", getRandomMac());
    $networkObject.setAttribute("data-switch-enp0s8", "");

    $networkObject.setAttribute("ip-enp0s9", "");
    $networkObject.setAttribute("netmask-enp0s9", "");
    $networkObject.setAttribute("mac-enp0s9", getRandomMac());
    $networkObject.setAttribute("data-switch-enp0s9", "");

    //opciones avanzadas

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showObjectModalTable(event, '.routing-table')"> Ver Tabla de Enrutamiento </button>
        <button onclick="showObjectModalTable(event, '.arp-table')">Ver Tabla ARP</button>
        <button onclick="showObjectModalTable(event, '.firewall-table')">Ver Tabla Firewall</button>
        <button onclick="deleteItem(event)">Eliminar</button>`;

    networkObjectAdvancedOptions.setAttribute("onclick", "event.stopPropagation()");

    //construimos el objeto

    $networkObject.appendChild(networkObjectIcon);
    $networkObject.appendChild(networkObjectArpTable);
    $networkObject.appendChild(networkObjectRoutingTable);
    $networkObject.appendChild(networkObjectAdvancedOptions);
    $networkObject.appendChild(networkObjectFirewallTable);

    //eventos

    $networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $networkObject.setAttribute("onclick", "showRouterSpecs(event)");
    
    itemIndex++;

    return $networkObject;

}
function RouterObject(x, y) {

    const $networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectRoutingTable = document.createElement("article");
    const networkObjectAdvancedOptions = document.createElement("div");
    const firewallTable = document.createElement("article");

    //características generales

    $networkObject.id = `router-${itemIndex}`;
    $networkObject.classList.add("item-dropped", "router");
    [x,y] = checkObjectClip(x, y); //comprobamos si el objeto queda clipeado fuera del tablero, y lo ajustamos
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.setAttribute("mac-enp0s3", getRandomMac());
    $networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //icono

    networkObjectIcon.src = "./assets/board/router.svg";
    networkObjectIcon.alt = "router";
    networkObjectIcon.draggable = true;
    $networkObject.appendChild(networkObjectIcon);

    //direcciones ip de cada interfaz del router

    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("ip-enp0s8", "");
    $networkObject.setAttribute("netmask-enp0s8", "");
    $networkObject.setAttribute("ip-enp0s9", "");
    $networkObject.setAttribute("netmask-enp0s9", "");

    //switches a los que está conectado el router en cada interfaz

    $networkObject.setAttribute("data-switch-enp0s3", "");
    $networkObject.setAttribute("data-switch-enp0s8", "");
    $networkObject.setAttribute("data-switch-enp0s9", "");

    //tabla de arp

    networkObjectArpTable.classList.add("arp-table");
    networkObjectArpTable.innerHTML = `
        <table>
            <tr>
                <th>IP Address</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeARPTable(event)">Cerrar</button>`;
    
    $networkObject.appendChild(networkObjectArpTable);

    //tabla de enrutamiento

    networkObjectRoutingTable.classList.add("routing-table");
    networkObjectRoutingTable.innerHTML = `
            <table>
                <tr>
                    <th>Destination</th>
                    <th>Netmask</th>
                    <th>Gateway</th>
                    <th>Interface</th>
                    <th>Next Hop</th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0 </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0 </td>
                </tr>
                <tr>
                    <td> 0.0.0.0 </td>
                    <td> 0.0.0.0 </td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </table>
            <button onclick="closeRoutingTable(event)">Cerrar</button>`;

    $networkObject.appendChild(networkObjectRoutingTable);

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
                    <th>Source Port</th>
                    <th>Destination Port</th>
                    <th>Action</th>
                </tr>
            </table>
            <button onclick="closeFirewallTable(event)">Cerrar</button>`;

    $networkObject.appendChild(firewallTable);

    //opciones avanzadas

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showRoutingTable(event)"> Ver Tabla de Enrutamiento </button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="showRouterFirewallTable(event)">Ver Tabla Firewall</button>
        <button onclick="deleteItem(event)">Eliminar</button>`;
    $networkObject.appendChild(networkObjectAdvancedOptions);

    //eventos

    $networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $networkObject.setAttribute("onclick", "showRouterSpecs(event)");
    networkObjectRoutingTable.setAttribute("onclick", "event.stopPropagation()");
    networkObjectAdvancedOptions.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $networkObject;

}
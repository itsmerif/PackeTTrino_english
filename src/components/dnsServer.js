function DnsServerObject(x, y) {

    const $board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectDnsTable = document.createElement("article");
    const firewallTable = document.createElement("article");

    //caracteristicas generales

    networkObject.id = `dns-server-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.classList.add("item-dropped", "dns-server");
    networkObject.setAttribute("ip-enp0s3", "");
    networkObject.setAttribute("netmask-enp0s3", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch-enp0s3", "");
    networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    networkObject.setAttribute("named", "true");

    //caracteristicas especiales

    networkObject.setAttribute("recursion", "false");

    //icono

    networkObjectIcon.src = "./assets/board/dns.svg";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showDnsTable(event)">Ver Registros DNS</button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    networkObject.appendChild(advancedOptions);

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
    
    networkObject.appendChild(networkObjectArpTable);

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

    networkObject.appendChild(firewallTable);

    //tabla de registros dns

    networkObjectDnsTable.classList.add("dns-table");
    networkObjectDnsTable.innerHTML = `
                <table>
                    <tr>
                        <th>Domain</th>
                        <th>Type</th>
                        <th>Value</th>
                    </tr>
                </table>
                <button onclick="closeDnsTable(event)">Cerrar</button>`;

    networkObject.appendChild(networkObjectDnsTable);

    //eventos

    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    networkObject.setAttribute("onclick", "showDnsForm(event)");
    networkObjectArpTable.setAttribute("onclick", "(event) => { event.stopPropagation(); }");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");

    $board.appendChild(networkObject);
    itemIndex++;
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    table.style.display = "none";
}

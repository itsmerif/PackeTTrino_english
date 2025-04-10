function DnsServerObject(x, y) {

    const $dnsServerObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectDnsTable = document.createElement("article");
    const firewallTable = document.createElement("article");

    //caracteristicas generales

    $dnsServerObject.id = `dns-server-${itemIndex}`;
    [x,y] = checkObjectClip(x, y);
    $dnsServerObject.style.left = `${x}px`;
    $dnsServerObject.style.top = `${y}px`;
    $dnsServerObject.classList.add("item-dropped", "dns-server");
    $dnsServerObject.setAttribute("ip-enp0s3", "");
    $dnsServerObject.setAttribute("netmask-enp0s3", "");
    $dnsServerObject.setAttribute("mac-enp0s3", getRandomMac());
    $dnsServerObject.setAttribute("data-gateway", "");
    $dnsServerObject.setAttribute("data-switch-enp0s3", "");
    $dnsServerObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    $dnsServerObject.setAttribute("named", "true");

    //caracteristicas especiales

    $dnsServerObject.setAttribute("recursion", "false");

    //icono

    networkObjectIcon.src = "./assets/board/dns.svg";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    $dnsServerObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showDnsTable(event)">Ver Registros DNS</button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    $dnsServerObject.appendChild(advancedOptions);

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
    
    $dnsServerObject.appendChild(networkObjectArpTable);

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

    $dnsServerObject.appendChild(firewallTable);

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

    $dnsServerObject.appendChild(networkObjectDnsTable);

    //eventos

    $dnsServerObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $dnsServerObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $dnsServerObject.setAttribute("onclick", "showDnsForm(event)");
    networkObjectArpTable.setAttribute("onclick", "(event) => { event.stopPropagation(); }");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $dnsServerObject;
    
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    table.style.display = "none";
}

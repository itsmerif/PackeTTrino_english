function DnsServerObject(x, y) {

    const $dnsServerObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = arpTable();
    const networkObjectDnsTable = dnsTable();
    const networkObjectFirewallTable = firewallTable();

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

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showObjectModalTable(event, '.dns-table')">Ver Registros DNS</button>
        <button onclick="showObjectModalTable(event, '.arp-table')">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    $dnsServerObject.appendChild(advancedOptions);

    //construimos el objeto

    $dnsServerObject.appendChild(networkObjectIcon);
    $dnsServerObject.appendChild(networkObjectArpTable);
    $dnsServerObject.appendChild(networkObjectDnsTable);
    $dnsServerObject.appendChild(networkObjectFirewallTable);
    $dnsServerObject.appendChild(advancedOptions);

    //eventos

    $dnsServerObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $dnsServerObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $dnsServerObject.setAttribute("onclick", "showDnsForm(event)");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");
    itemIndex++;

    return $dnsServerObject;
    
}

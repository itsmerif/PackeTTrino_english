function createDnsServerObject(x, y) {

    const $board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectDnsTable = document.createElement("article");
    const firewallTable = document.createElement("article");

    //caracteristicas generales

    networkObject.id = `dns-server-${itemIndex}`;
    [x,y] = checkObjectClip(x, y); //comprobamos si el objeto queda clipeado fuera del tablero, y lo ajustamos
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.classList.add("item-dropped", "dns-server");
    networkObject.setAttribute("data-ip", "");
    networkObject.setAttribute("data-netmask", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");
    networkObject.setAttribute("data-dhcp", false);
    networkObject.setAttribute("data-dhcp-server", "");
    networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //caracteristicas especiales

    networkObject.setAttribute("recursion", "false");

    //server grafico

    networkObjectIcon.src = "./assets/board/dns.png";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showDnsForm(event)">Configurar DNS</button>
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
    networkObject.setAttribute("onclick", "showDnsTable(event)");
    networkObjectArpTable.setAttribute("onclick", "(event) => { event.stopPropagation(); }");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");

    $board.appendChild(networkObject);
    itemIndex++;
}

function showDnsForm(event) {
    event.stopPropagation();
    const form = document.querySelector(".dns-form");
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    const $serverObject = event.target.closest(".item-dropped");
    const id = $serverObject.id;
    const ip = $serverObject.getAttribute("data-ip");
    const netmask = $serverObject.getAttribute("data-netmask");
    const gateway = $serverObject.getAttribute("data-gateway");
    const isRecursive = $serverObject.getAttribute("recursion");
    form.querySelector("#ip-dns").value = ip;
    form.querySelector("#netmask-dns").value = netmask;
    form.querySelector("#gateway-dns").value = gateway;
    form.querySelector("#dns-recursive").checked = isRecursive === "true";
    document.getElementById("form-dns-item-id").innerHTML = id;
    form.style.display = "flex";
}

function saveDnsSpecs(event) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.target.closest("form");
    //tomo los datos del formulario
    const id = form.querySelector("#form-dns-item-id").innerHTML;
    const $serverObject = document.getElementById(id);
    const ip = form.querySelector("#ip-dns").value;
    const netmask = form.querySelector("#netmask-dns").value;
    const gateway = form.querySelector("#gateway-dns").value;
    const isRecursive = form.querySelector("#dns-recursive").checked;
    //actualizo el servidor
    $serverObject.setAttribute("data-ip", ip);
    $serverObject.setAttribute("data-netmask", netmask);
    $serverObject.setAttribute("data-gateway", gateway);
    $serverObject.setAttribute("recursion", isRecursive);
    //limpio el formulario
    form.reset();
    form.style.display = "none";
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    table.style.display = "none";
}

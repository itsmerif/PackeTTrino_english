function createDnsServerObject(x, y) {

    const $board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectDnsTable = document.createElement("article");

    //caracteristicas generales

    networkObject.id = `dns-server-${itemIndex}`;
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.classList.add("item-dropped", "dns-server");
    networkObject.setAttribute("data-ip", "");
    networkObject.setAttribute("data-netmask", "");
    networkObject.setAttribute("data-network", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");
    networkObject.setAttribute("data-dhcp", false);
    networkObject.setAttribute("data-dhcp-server", "");

    //caracteristicas especiales

    networkObject.setAttribute("authoritative", "false");
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
        <button onclick="showPcForm(${networkObject.id})">Configurar DNS</button>
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

    $board.appendChild(networkObject);
    itemIndex++;
}

function showDnsForm(id) {
    //
}

function saveDnsSpecs(event) {
    //
}

function showAdvancedOptions(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
}

function showDnsTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".dns-table");
    table.style.display = "flex";
}

function closeDnsTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".dns-table");
    table.style.display = "none";
}

function showARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
    table.style.display = "flex";
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    table.style.display = "none";
}

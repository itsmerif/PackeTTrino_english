//discover -> offer -> request -> ack

function createDhcpServerObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectDhcpTable = document.createElement("article");


    //caracteristicas generales

    networkObject.id = `dhcp-server-${itemIndex}`;
    networkObject.classList.add("item-dropped", "dhcp-server");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("data-ip", "");
    networkObject.setAttribute("data-netmask", "");
    networkObject.setAttribute("data-network", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");

    //configuracion de oferta

    networkObject.setAttribute("data-range-start", "");
    networkObject.setAttribute("data-range-end", "");
    networkObject.setAttribute("offer-gateway", "");
    networkObject.setAttribute("offer-netmask", "");

    //server grafico

    networkObjectIcon.src = "./assets/board/server.png";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showDhcpSpecs(event)"> Configurar DHCP </button>
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

    //tabla de alquileres

    networkObjectDhcpTable.classList.add("dhcp-table");
    networkObjectDhcpTable.innerHTML = `
                <table>
                    <tr>
                        <th>IP</th>
                        <th>MAC</th>
                        <th>Hostname</th>
                        <th>Lease Time</th>
                    </tr>
                </table>
                <button onclick="closeDhcpTable(event)">Cerrar</button>`;

    networkObject.appendChild(networkObjectDhcpTable);

    //eventos

    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptionsDHCP(event)");
    networkObject.setAttribute("onclick", "showDhcpTable(event)");

    board.appendChild(networkObject);
    itemIndex++;

}

function showAdvancedOptionsDHCP(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
}

function showDhcpTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".dhcp-table");
    table.style.display = "flex";
}

function closeDhcpTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".dhcp-table");
    table.style.display = "none";
}

function showDhcpSpecs(event) { 
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const itemId = networkObject.id; //obtenemos el id del elemento

    //obtenemos los atributos del servidor
    const ip = networkObject.getAttribute("data-ip");
    const netmask = networkObject.getAttribute("data-netmask");
    const gateway = networkObject.getAttribute("data-gateway");
    const rangeStart = networkObject.getAttribute("data-range-start");
    const rangeEnd = networkObject.getAttribute("data-range-end");
    const offerGateway = networkObject.getAttribute("offer-gateway");
    const offerNetmask = networkObject.getAttribute("offer-netmask");

    //mostramos el formulario
    document.querySelector(".dhcp-form #ip-dhcp").value = ip;
    document.querySelector(".dhcp-form #netmask-dhcp").value = netmask;
    document.querySelector(".dhcp-form #gateway-dhcp").value = gateway;
    document.querySelector(".dhcp-form #range-start").value = rangeStart;
    document.querySelector(".dhcp-form #range-end").value = rangeEnd;
    document.getElementById("form-dhcp-item-id").innerHTML = itemId;
    document.querySelector(".dhcp-form #offer-gateway").value = offerGateway;
    document.querySelector(".dhcp-form #offer-netmask").value = offerNetmask;

    //ocultamos y mostramos
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    document.querySelector(".dhcp-form").style.display = "flex";
}

function saveDhcpSpecs(event) {

    event.preventDefault();
    const networkObject = document.getElementById(document.getElementById("form-dhcp-item-id").innerHTML);

    //obtenemos los valores del formulario  

    const newIp = document.querySelector(".dhcp-form #ip-dhcp").value;
    const newNetmask = document.querySelector(".dhcp-form #netmask-dhcp").value;
    const newGateway = document.querySelector(".dhcp-form #gateway-dhcp").value;
    const newRangeStart = document.querySelector(".dhcp-form #range-start").value;
    const newRangeEnd = document.querySelector(".dhcp-form #range-end").value;
    const newOfferGateway = document.querySelector(".dhcp-form #offer-gateway").value;
    const newOfferNetmask = document.querySelector(".dhcp-form #offer-netmask").value;

    //guardamos los nuevos atributos en el server

    networkObject.setAttribute("data-ip", newIp);
    networkObject.setAttribute("data-netmask", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-range-start", newRangeStart);
    networkObject.setAttribute("data-range-end", newRangeEnd);
    networkObject.setAttribute("offer-gateway", newOfferGateway);
    networkObject.setAttribute("offer-netmask", newOfferNetmask);

    //ocultamos el formulario

    document.querySelector(".dhcp-form").style.display = "none";

}
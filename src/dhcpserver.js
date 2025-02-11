//discover -> offer -> request -> ack

function createDhcpServerObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectTable = document.createElement("article");


    //caracteristicas generales

    networkObject.id = `server-${itemIndex}`;
    networkObject.classList.add("item-dropped", "server");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("data-ip", "");
    networkObject.setAttribute("data-netmask", "");
    networkObject.setAttribute("data-network", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");
    networkObject.setAttribute("data-range-start", "");
    networkObject.setAttribute("data-range-end", "");

    //server grafico

    networkObjectIcon.src = "./assets/server.png";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showDhcpSpecs(event)"> Configurar DHCP </button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    networkObject.appendChild(advancedOptions);

    //tabla de alquileres

    //tabla de enrutamiento

    networkObjectTable.classList.add("mac-table");
    networkObjectTable.innerHTML = `
                <table>
                    <tr>
                        <th>IP</th>
                        <th>MAC</th>
                        <th>Hostname</th>
                        <th>Lease Time</th>
                    </tr>
                </table>
                <button onclick="closeRoutingTable(event)">Cerrar</button>`;

    networkObject.appendChild(networkObjectTable);

    //eventos

    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptionsDHCP(event)");
    networkObject.setAttribute("onclick", "showLeasesTable(event)");

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

function showLeasesTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "flex";
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

    //mostramos el formulario
    document.querySelector(".dhcp-form #ip-dhcp").value = ip;
    document.querySelector(".dhcp-form #netmask-dhcp").value = netmask;
    document.querySelector(".dhcp-form #gateway-dhcp").value = gateway;
    document.querySelector(".dhcp-form #range-start").value = rangeStart;
    document.querySelector(".dhcp-form #range-end").value = rangeEnd;
    document.getElementById("form-dhcp-item-id").innerHTML = itemId;

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

    //guardamos los nuevos atributos en el server

    networkObject.setAttribute("data-ip", newIp);
    networkObject.setAttribute("data-netmask", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-range-start", newRangeStart);
    networkObject.setAttribute("data-range-end", newRangeEnd);

    //ocultamos el formulario

    document.querySelector(".dhcp-form").style.display = "none";

}
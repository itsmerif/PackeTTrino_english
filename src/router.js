function createRouterObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectArpTable = document.createElement("article");
    const networkObjectRoutingTable = document.createElement("article");
    const networkObjectAdvancedOptions = document.createElement("div");

    //características generales

    networkObject.id = `router-${itemIndex}`;
    networkObject.classList.add("item-dropped", "router");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("data-mac", getRandomMac());

    //icono

    networkObjectIcon.src = "./assets/board/router.png";
    networkObjectIcon.alt = "router";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //direcciones ip de cada interfaz del router

    networkObject.setAttribute("ip-enp0s3", "");
    networkObject.setAttribute("netmask-enp0s3", "");
    networkObject.setAttribute("ip-enp0s8", "");
    networkObject.setAttribute("netmask-enp0s8", "");
    networkObject.setAttribute("ip-enp0s9", "");
    networkObject.setAttribute("netmask-enp0s9", "");

    //switches a los que está conectado el router en cada interfaz

    networkObject.setAttribute("data-switch-enp0s3", "");
    networkObject.setAttribute("data-switch-enp0s8", "");
    networkObject.setAttribute("data-switch-enp0s9", "");

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

    networkObject.appendChild(networkObjectRoutingTable);

    //opciones avanzadas

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showRouterSpecs(event)"> Configurar Interfaces de Red </button>
        <button onclick="showRouterARPTable(event)">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>`;
    networkObject.appendChild(networkObjectAdvancedOptions);

    //eventos

    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptionsRouter(event)");
    networkObject.setAttribute("onclick", "showRoutingTable(event)");
    networkObjectRoutingTable.setAttribute("onclick", "event.stopPropagation()");

    //añadir el elemento al tablero y aumentar el indice global

    board.appendChild(networkObject);
    itemIndex++;

}

function showRoutingTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".routing-table");
    table.style.display = "flex";
}

function closeRoutingTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".routing-table");
    table.style.display = "none";
}

function showAdvancedOptionsRouter(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
}

function showRouterSpecs(event) {
    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    const networkObject = event.target.closest(".item-dropped");
    const form = document.querySelector(".router-form");
    const ipEnp0s3 = networkObject.getAttribute("ip-enp0s3");
    const ipEnp0s8 = networkObject.getAttribute("ip-enp0s8");
    const ipEnp0s9 = networkObject.getAttribute("ip-enp0s9");
    const netmaskEnp0s3 = networkObject.getAttribute("netmask-enp0s3");
    const netmaskEnp0s8 = networkObject.getAttribute("netmask-enp0s8");
    const netmaskEnp0s9 = networkObject.getAttribute("netmask-enp0s9");
    form.querySelector("#ip-enp0s3").value = ipEnp0s3;
    form.querySelector("#ip-enp0s8").value = ipEnp0s8;
    form.querySelector("#ip-enp0s9").value = ipEnp0s9;
    form.querySelector("#netmask-enp0s3").value = netmaskEnp0s3;
    form.querySelector("#netmask-enp0s8").value = netmaskEnp0s8;
    form.querySelector("#netmask-enp0s9").value = netmaskEnp0s9;
    document.getElementById("form-router-item-id").innerHTML = networkObject.id;
    form.style.display = "flex";
}

function showRouterARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
    table.style.display = "flex";
}

function saveRouterSpecs(event) {

    event.preventDefault();
    const form = document.querySelector(".router-form");
    const networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);

    //obtenemos los valores del formulario  

    const newIpEnp0s3 = document.querySelector(".router-form #ip-enp0s3").value;
    const newIpEnp0s8 = document.querySelector(".router-form #ip-enp0s8").value;
    const newIpEnp0s9 = document.querySelector(".router-form #ip-enp0s9").value;
    const newNetmaskEnp0s3 = document.querySelector(".router-form #netmask-enp0s3").value;
    const newNetmaskEnp0s8 = document.querySelector(".router-form #netmask-enp0s8").value;
    const newNetmaskEnp0s9 = document.querySelector(".router-form #netmask-enp0s9").value;

    //guardamos los nuevos atributos en el router

    networkObject.setAttribute("ip-enp0s3", newIpEnp0s3);
    networkObject.setAttribute("ip-enp0s8", newIpEnp0s8);
    networkObject.setAttribute("ip-enp0s9", newIpEnp0s9);
    networkObject.setAttribute("netmask-enp0s3", newNetmaskEnp0s3);
    networkObject.setAttribute("netmask-enp0s8", newNetmaskEnp0s8);
    networkObject.setAttribute("netmask-enp0s9", newNetmaskEnp0s9);

    //generamos nuevas reglas de conexion directa en la tabla de enrutamiento

    const routingTable = networkObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    const interfaces = [
        { ip: newIpEnp0s3, netmask: newNetmaskEnp0s3, interface: "enp0s3" },
        { ip: newIpEnp0s8, netmask: newNetmaskEnp0s8, interface: "enp0s8" },
        { ip: newIpEnp0s9, netmask: newNetmaskEnp0s9, interface: "enp0s9" }
    ];

    interfaces.forEach((iface, index) => {
        const row = rows[index + 1];
        const cells = row.querySelectorAll("td");
        if (getNetwork(iface.ip, iface.netmask) !== "0.0.0.0") cells[0].innerHTML = getNetwork(iface.ip, iface.netmask);
        cells[1].innerHTML = iface.netmask;
        cells[2].innerHTML = iface.ip;
        cells[3].innerHTML = iface.interface;
    });

    form.style.display = "none";
}
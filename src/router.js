function createRouterObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectTable = document.createElement("article");
    const networkObjectAdvancedOptions = document.createElement("div");

    //router grafico con icono
    networkObject.classList.add("item-dropped", "router");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.id = `router-${itemIndex}`;
    networkObjectIcon.src = "./assets/router.png";
    networkObjectIcon.alt = "router";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //tabla de enrutamiento

    networkObjectTable.classList.add("mac-table");
    networkObjectTable.innerHTML = `
            <table>
                <tr>
                    <th>Destination</th>
                    <th>Netmask</th>
                    <th>Gateway</th>
                    <th>Next Hop</th>
                </tr>
            </table>
            <button onclick="closeRoutingTable(event)">Cerrar</button>`;

    networkObject.appendChild(networkObjectTable);

    //opciones avanzadas

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>`;
    networkObject.appendChild(networkObjectAdvancedOptions);

    //eventos
    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));
    networkObject.addEventListener("click", showRoutingTable);
    networkObject.addEventListener("contextmenu", event => showAdvancedOptionsRouter(event));

    //añadir el elemento al tablero y aumentar el indice global
    board.appendChild(networkObject);
    itemIndex++;

}

function showRoutingTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "flex";
}

function closeRoutingTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "none";
}

function showAdvancedOptionsRouter(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
}
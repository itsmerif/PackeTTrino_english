function createSwitchObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectTable = document.createElement("article");

    networkObject.id = `switch-${itemIndex}`;

    networkObjectIcon.src = "./assets/switch.png";
    networkObjectIcon.alt = "switch";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    networkObjectTable.classList.add("mac-table");
    networkObjectTable.innerHTML = `
            <table>
                <tr>
                    <th>Port</th>
                    <th>MAC Address</th>
                </tr>
            </table>
            <button onclick="closeMacTable(event)">Cerrar</button>`;

    networkObject.appendChild(networkObjectTable);

    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));
    networkObject.addEventListener("drop", switchConn);
    networkObject.addEventListener("click", showMacTable);


    networkObject.classList.add("item-dropped", "switch");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    board.appendChild(networkObject);

    itemIndex++;

}

function switchConn(event) {

    event.preventDefault();
    event.stopPropagation();

    const item = event.dataTransfer.getData("json");
    const networkObject = event.target.closest(".item-dropped");

    if (item) {

        const itemType = JSON.parse(item).itemType; //averiguo si es un item dropeable
        const itemId = JSON.parse(item).itemId; //obtengo el id del item
        const x1 = JSON.parse(item).originx; //obtengo el x del elemento origen
        const y1 = JSON.parse(item).originy; //obtengo el y del elemento origen
        const mac = JSON.parse(item).mac;

        if (itemType === "item-dropped" && (itemId.startsWith("pc-") || itemId.startsWith("router-") || itemId.startsWith("server-"))) {
            createCableObject(x1, y1, networkObject.style.left, networkObject.style.top, itemId, networkObject.id);
            saveMac(event, mac);
            document.getElementById(itemId).setAttribute("data-switch", networkObject.id);
            networkObject.querySelector("img").draggable = false; //el switch no se puede arrastrar
            if (itemId.startsWith("pc-")) {
                document.getElementById(itemId).querySelector("img").draggable = true; //el pc no se puede arrastrar
            }
        }

    }
}

function showMacTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "flex";
}

function closeMacTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "none";
}

function saveMac(event, mac) {
    const networkObject = event.target.closest(".item-dropped");
    const networtTable = networkObject.querySelector("table");
    const newMac = document.createElement("tr");
    newMac.innerHTML = `
        <tr>
            <td>1</td>
            <td class="mac-address">${mac}</td>
        </tr>`;
    networtTable.appendChild(newMac);
}

function deleteMacEntry(switchId, mac) {
    const switchObject = document.getElementById(switchId);
    const table = switchObject.querySelector("table");
    const tds = table.querySelectorAll("td");
    for (let td of tds) {
        if (td.innerHTML === mac) {
            const tr = td.parentElement;
            tr.remove();
            break;
        }
    }
}

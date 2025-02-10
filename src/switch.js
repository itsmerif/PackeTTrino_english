function createSwitchObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectTable = document.createElement("article");
    const networkObjectAdvancedOptions = document.createElement("div");

    //caracteristicas generales

    networkObject.id = `switch-${itemIndex}`;
    networkObject.classList.add("item-dropped", "switch");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("data-mac", getRandomMac());

    //switch grafico con icono

    networkObjectIcon.src = "./assets/switch.png";
    networkObjectIcon.alt = "switch";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //tabla de macs

    networkObjectTable.classList.add("mac-table");
    networkObjectTable.innerHTML = `
            <table>
                <tr>
                    <th>Device</th>
                    <th>MAC Address</th>
                </tr>
            </table>
            <button onclick="closeMacTable(event)">Cerrar</button>`;

    networkObject.appendChild(networkObjectTable);

    //opciones avanzadas

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `<button onclick="deleteItem(event)">Eliminar</button>`;
    networkObject.appendChild(networkObjectAdvancedOptions);

    //eventos
    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));
    networkObject.addEventListener("drop", switchConn);
    networkObject.addEventListener("click", showMacTable);
    networkObject.addEventListener("contextmenu", event => showAdvancedOptionsSwitch(event));


    //añadir el elemento al tablero y aumentar el indice global
    board.appendChild(networkObject);
    itemIndex++;

}

function showAdvancedOptionsSwitch(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
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

        if (itemType === "item-dropped" && (itemId.startsWith("pc-") || itemId.startsWith("server-"))) {

            createCableObject(x1, y1, networkObject.style.left, networkObject.style.top, itemId, networkObject.id);
            saveConn(event, itemId);
            document.getElementById(itemId).setAttribute("data-switch", networkObject.id);
            networkObject.querySelector("img").draggable = false; //el switch no se puede arrastrar
            document.getElementById(itemId).querySelector("img").draggable = false; //el pc no se puede arrastrar

        }

        if (itemType === "item-dropped" && itemId.startsWith("router-")) {

            const routerObject = document.getElementById(itemId);
            const enp0s3Conn = routerObject.getAttribute("data-switch-enp0s3");
            const enp0s8Conn = routerObject.getAttribute("data-switch-enp0s8");
            const enp0s9Conn = routerObject.getAttribute("data-switch-enp0s9");

            if (enp0s3Conn === "") {

                createCableObject(x1, y1, networkObject.style.left, networkObject.style.top, itemId, networkObject.id);
                saveConn(event, itemId);
                document.getElementById(itemId).setAttribute("data-switch-enp0s3", networkObject.id);
                networkObject.querySelector("img").draggable = false; //el switch no se puede arrastrar

            } else if (enp0s8Conn === "") {

                createCableObject(x1, y1, networkObject.style.left, networkObject.style.top, itemId, networkObject.id);
                saveConn(event, itemId);
                document.getElementById(itemId).setAttribute("data-switch-enp0s8", networkObject.id);
                networkObject.querySelector("img").draggable = false; //el switch no se puede arrastrar

            } else if (enp0s9Conn === "") {

                createCableObject(x1, y1, networkObject.style.left, networkObject.style.top, itemId, networkObject.id);
                saveConn(event, itemId);
                document.getElementById(itemId).setAttribute("data-switch-enp0s9", networkObject.id);
                routerObject.querySelector("img").draggable = false; //el router ya no se puede arrastrar
                networkObject.querySelector("img").draggable = false; //el switch no se puede arrastrar

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

function saveConn(event, itemdId) {
    const switchObject = event.target.closest(".item-dropped");
    const macTable = switchObject.querySelector("table");
    const newMac = document.createElement("tr");
    newMac.innerHTML = `
        <tr>
            <td class="device-name">${itemdId}</td>
            <td class="mac-address"></td>
        </tr>`;
    macTable.appendChild(newMac);
}

function deleteMacEntry(switchId, networkObjectId) {
    const switchObject = document.getElementById(switchId);
    const table = switchObject.querySelector("table");
    const tds = table.querySelectorAll("td");

    for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.innerHTML === networkObjectId) {
            const tr = td.parentElement; //obtenemos el elemento padre
            tr.remove(); //eliminamos la entrada
            break;
        }
    }
}

function saveMac(switchObjectId, networkObjectId, newMac) {

    const switchObject = document.getElementById(switchObjectId);
    const macTable = switchObject.querySelector("table");
    const rows = macTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) { //empezamos por el primer elemento, ya que el primero es el header
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        if (cells[0].innerHTML === networkObjectId) {
            cells[1].innerHTML = newMac;
            break;
        }
    }

}
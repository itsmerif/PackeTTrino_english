function createSwitchObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectTable = document.createElement("article");
    const networkObjectAdvancedOptions = document.createElement("div");

    //caracteristicas generales

    networkObject.id = `switch-${itemIndex}`;
    networkObject.classList.add("item-dropped", "switch");
    [x,y] = checkObjectClip(x, y); //comprobamos si el objeto queda clipeado fuera del tablero, y lo ajustamos
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("clusterized", "false");

    //switch grafico con icono

    networkObjectIcon.src = "./assets/board/switch.svg";
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
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="deleteItem(event)">Eliminar</button>
        <button class="clusterize-button" onclick="clusterizeSwitch(event)">Clusterizar</button>
        `;
    networkObject.appendChild(networkObjectAdvancedOptions);

    //eventos
    
    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    networkObject.setAttribute("ondrop", "switchConn(event)");
    networkObject.setAttribute("onclick", "showMacTable(event)");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");


    //añadir el elemento al tablero y aumentar el indice global
    board.appendChild(networkObject);
    itemIndex++;

}

function switchConn(event) {

    event.preventDefault();
    event.stopPropagation();

    const item = event.dataTransfer.getData("json");
    const switchObject = event.target.closest(".item-dropped");
    const isClusterized = switchObject.getAttribute("clusterized");

    if (item) {

        if (isClusterized === "true") {
            popupMessage("<span>Error:</span> Debes des-clusterizar el switch antes de poder conectar otro dispositivo");
            return;
        }

        const itemType = JSON.parse(item).itemType; //averiguo si es un item dropeable
        const itemId = JSON.parse(item).itemId; //obtengo el id del item
        const x1 = JSON.parse(item).originx; //obtengo el x del elemento origen
        const y1 = JSON.parse(item).originy; //obtengo el y del elemento origen
        const mac = JSON.parse(item).mac;

        if (itemType === "item-dropped" && (itemId.startsWith("pc-") || itemId.startsWith("dhcp-server-") || itemId.startsWith("dhcp-relay-server-") || itemId.startsWith("dns-server-"))) {

            createCableObject(x1, y1, switchObject.style.left, switchObject.style.top, itemId, switchObject.id);
            saveConn(event, itemId);
            document.getElementById(itemId).setAttribute("data-switch-enp0s3", switchObject.id);
            switchObject.querySelector("img").draggable = false; //el switch no se puede arrastrar
            document.getElementById(itemId).querySelector("img").draggable = false; //el pc no se puede arrastrar

        }

        if (itemType === "item-dropped" && itemId.startsWith("router-")) {

            const routerObject = document.getElementById(itemId);
            const enp0s3Conn = routerObject.getAttribute("data-switch-enp0s3");
            const enp0s8Conn = routerObject.getAttribute("data-switch-enp0s8");
            const enp0s9Conn = routerObject.getAttribute("data-switch-enp0s9");

            if (enp0s3Conn === "") {

                createCableObject(x1, y1, switchObject.style.left, switchObject.style.top, itemId, switchObject.id, "enp0s3");
                saveConn(event, itemId);
                document.getElementById(itemId).setAttribute("data-switch-enp0s3", switchObject.id);
                switchObject.querySelector("img").draggable = false; //el switch no se puede arrastrar

            } else if (enp0s8Conn === "") {

                createCableObject(x1, y1, switchObject.style.left, switchObject.style.top, itemId, switchObject.id, "enp0s8");
                saveConn(event, itemId);
                document.getElementById(itemId).setAttribute("data-switch-enp0s8", switchObject.id);
                switchObject.querySelector("img").draggable = false; //el switch no se puede arrastrar

            } else if (enp0s9Conn === "") {

                createCableObject(x1, y1, switchObject.style.left, switchObject.style.top, itemId, switchObject.id, "enp0s9");
                saveConn(event, itemId);
                document.getElementById(itemId).setAttribute("data-switch-enp0s9", switchObject.id);
                routerObject.querySelector("img").draggable = false; //el router ya no se puede arrastrar
                switchObject.querySelector("img").draggable = false; //el switch no se puede arrastrar

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

function clusterizeSwitch(event) {
    event.preventDefault();
    event.stopPropagation();
    const $switchObject = event.target.closest(".item-dropped");
    const $advancedOptions = $switchObject.querySelector(".advanced-options-modal");
    const $icon = $switchObject.querySelector("img");
    const $connectedDevices = getDeviceTable($switchObject.id);
    
    $connectedDevices.forEach(deviceId => { 
        if (!deviceId.startsWith("router-")) {
            let $device = document.getElementById(deviceId); //nodo con el dispositivo
            let [$connsLines, $connsCircles] = getConns(deviceId); //nodos con las conexiones que parten de ese dispositivo
            Array.from($connsLines).forEach( $conn => $conn.style.display = "none"); //oculto las conexiones 
            Array.from($connsCircles).forEach( $conn => $conn.style.display = "none"); //oculto las conexiones
            $device.style.display = "none"; //oculto el dispositivo
        }
    });

    $advancedOptions.querySelector(".clusterize-button").innerHTML = "Des-clusterizar";
    $advancedOptions.querySelector(".clusterize-button").setAttribute("onclick", "desClusterizeSwitch(event)");
    $switchObject.setAttribute("clusterized", "true");
    $icon.src = "./assets/board/cluster.svg";
    $advancedOptions.style.display = "none";
}

function desClusterizeSwitch(event) {
    event.preventDefault();
    event.stopPropagation();
    const $switchObject = event.target.closest(".item-dropped");
    const $advancedOptions = $switchObject.querySelector(".advanced-options-modal");
    const $icon = $switchObject.querySelector("img");
    const $connectedDevices = getDeviceTable($switchObject.id);
    
    $connectedDevices.forEach(deviceId => { 
        if (!deviceId.startsWith("router-")) {
            let $device = document.getElementById(deviceId); //nodo con el dispositivo
            let [$connsLines, $connsCircles] = getConns(deviceId); //nodos con las conexiones que parten de ese dispositivo
            Array.from($connsLines).forEach( $conn => $conn.style.display = "block"); //oculto las conexiones 
            Array.from($connsCircles).forEach( $conn => $conn.style.display = "block"); //oculto las conexiones
            $device.style.display = "block"; //oculto el dispositivo
        }
    });

    $advancedOptions.querySelector(".clusterize-button").innerHTML = "Clusterizar";
    $advancedOptions.querySelector(".clusterize-button").setAttribute("onclick", "clusterizeSwitch(event)");
    $switchObject.setAttribute("clusterized", "false");
    $icon.src = "./assets/board/switch.png";
    $advancedOptions.style.display = "none";
}

function moveConns(switchId, dx, dy) {
    const $connectedDevices = getDeviceTable(switchId);

    $connectedDevices.forEach(deviceId => { 
        if (!deviceId.startsWith("router-")) {
            let $device = document.getElementById(deviceId); //nodo con el dispositivo
            let [$connsLines, $connsCircles] = getConns(deviceId); //nodos con las conexiones que parten de ese dispositivo
            //movemos las lineas
            Array.from($connsLines).forEach( $conn => { 
                $conn.setAttribute("x1", `${parseInt($conn.getAttribute("x1")) + dx}`);
                $conn.setAttribute("y1", `${parseInt($conn.getAttribute("y1")) + dy}`);
                $conn.setAttribute("x2", `${parseInt($conn.getAttribute("x2")) + dx}`);
                $conn.setAttribute("y2", `${parseInt($conn.getAttribute("y2")) + dy}`);
            });
            //movemos los circulos
            Array.from($connsCircles).forEach( $conn => { 
                $conn.setAttribute("cx", `${parseInt($conn.getAttribute("cx")) + dx}`);
                $conn.setAttribute("cy", `${parseInt($conn.getAttribute("cy")) + dy}`);
            });
            //movemos el dispostivo
            $device.style.left = `${parseInt($device.style.left) + dx}px`;
            $device.style.top = `${parseInt($device.style.top) + dy}px`;
        }
    });
}
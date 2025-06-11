function SwitchObject(x, y) {

    const $switchObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const networkObjectMacTable = macTable();
    const networkObjectAdvancedOptions = document.createElement("div");

    //caracteristicas generales

    $switchObject.id = `switch-${itemIndex}`;
    $switchObject.classList.add("item-dropped", "switch");
    [x, y] = checkObjectClip(x, y); //comprobamos si el objeto queda clipeado fuera del tablero, y lo ajustamos
    $switchObject.style.left = `${x}px`;
    $switchObject.style.top = `${y}px`;
    $switchObject.setAttribute("mac-enp0s3", getRandomMac());
    $switchObject.setAttribute("clusterized", "false");

    //switch grafico con icono

    networkObjectIcon.src = "./assets/board/switch.svg";
    networkObjectIcon.alt = "switch";
    networkObjectIcon.draggable = true;

    //opciones avanzadas

    networkObjectAdvancedOptions.classList.add("advanced-options-modal");
    networkObjectAdvancedOptions.innerHTML = `
        <button onclick="deleteItem(event)">Eliminar</button>
        <button class="clusterize-button" onclick="clusterizeSwitch(event)">Clusterizar</button>
        `;
    $switchObject.appendChild(networkObjectAdvancedOptions);

    //construimos el objeto

    $switchObject.appendChild(networkObjectIcon);
    $switchObject.appendChild(networkObjectMacTable);
    $switchObject.appendChild(networkObjectAdvancedOptions);

    //eventos

    $switchObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    $switchObject.setAttribute("ondrop", "switchConn(event)");
    $switchObject.setAttribute("onclick", "showObjectModalTable(event, '.mac-table')");
    $switchObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");

    return $switchObject;

}

function switchConn(event) {

    event.preventDefault();
    event.stopPropagation();

    const item = event.dataTransfer.getData("json");
    const $switchObject = event.target.closest(".item-dropped");
    const isClusterized = $switchObject.getAttribute("clusterized");

    if (isClusterized === "true") {
        bodyComponent.render(popupMessage(`<span>Error: </span>Debes des-clusterizar el switch antes de poder añadir dispositivos.`));
        return;
    }

    if (item) {

        const itemType = JSON.parse(item).itemType;
        const itemId = JSON.parse(item).itemId;
        const $networkObject = document.getElementById(itemId);
        const x1 = JSON.parse(item).originx;
        const y1 = JSON.parse(item).originy;

        if (itemType !== "item-dropped" || itemId.startsWith("switch-")) return;

        let availableInterface = getAvailableInterface(itemId);

        if (availableInterface) {
            CableObject(x1, y1, $switchObject.style.left, $switchObject.style.top, itemId, $switchObject.id, availableInterface);
            addSwitchPort($switchObject.id, itemId);
            $networkObject.setAttribute(`data-switch-${availableInterface}`, $switchObject.id);
            if(!getAvailableInterface(itemId)) $networkObject.querySelector("img").draggable = false;
        }

    }
}

function closeMacTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "none";
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
            let $device = document.getElementById(deviceId);
            let [$connsLines, $connsCircles] = getConns(deviceId);
            Array.from($connsLines).forEach($conn => $conn.style.display = "none"); 
            Array.from($connsCircles).forEach($conn => $conn.style.display = "none");
            $device.style.display = "none";
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
            Array.from($connsLines).forEach($conn => $conn.style.display = "block"); //oculto las conexiones 
            Array.from($connsCircles).forEach($conn => $conn.style.display = "block"); //oculto las conexiones
            $device.style.display = "block"; //oculto el dispositivo
        }
    });

    $advancedOptions.querySelector(".clusterize-button").innerHTML = "Clusterizar";
    $advancedOptions.querySelector(".clusterize-button").setAttribute("onclick", "clusterizeSwitch(event)");
    $switchObject.setAttribute("clusterized", "false");
    $icon.src = "./assets/board/switch.svg";
    $advancedOptions.style.display = "none";
}

function moveConns(switchId, dx, dy) {
    const $connectedDevices = getDeviceTable(switchId);

    $connectedDevices.forEach(deviceId => {
        if (!deviceId.startsWith("router-")) {
            let $device = document.getElementById(deviceId); 
            let [$connsLines, $connsCircles] = getConns(deviceId);

            Array.from($connsLines).forEach($conn => {
                $conn.setAttribute("x1", `${parseInt($conn.getAttribute("x1")) + dx}`);
                $conn.setAttribute("y1", `${parseInt($conn.getAttribute("y1")) + dy}`);
                $conn.setAttribute("x2", `${parseInt($conn.getAttribute("x2")) + dx}`);
                $conn.setAttribute("y2", `${parseInt($conn.getAttribute("y2")) + dy}`);
            });

            Array.from($connsCircles).forEach($conn => {
                $conn.setAttribute("cx", `${parseInt($conn.getAttribute("cx")) + dx}`);
                $conn.setAttribute("cy", `${parseInt($conn.getAttribute("cy")) + dy}`);
            });

            $device.style.left = `${parseInt($device.style.left) + dx}px`;
            $device.style.top = `${parseInt($device.style.top) + dy}px`;
        }
    });
}
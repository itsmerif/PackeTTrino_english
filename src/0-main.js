document.addEventListener("DOMContentLoaded", init);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {

    setTimeout(hideLoadingScreen, 1000); //ocultamos la pantalla de carga
    getPanelItems(); //obtenemos los items del panel
    await sleep(500); //esperamos 500ms para que se cargue el html

    //eventos del documento

    document.addEventListener("keydown", closeEveryThing);

    //eventos de los formularios

    document.querySelector(".pc-form").addEventListener("submit", savePcSpecs);
    document.querySelector(".pc-form").querySelector("input[type='checkbox']").addEventListener("change", disableOptionsPcForm);
    document.querySelector(".router-form").addEventListener("submit", saveRouterSpecs);
    document.querySelector(".dhcp-form").addEventListener("submit", saveDhcpSpecs);
    document.querySelector(".dns-form").addEventListener("submit", saveDnsSpecs);
    document.querySelector(".dhcp-relay-form").addEventListener("submit", saveDhcpRelaySpecs);


    //eventos del panel

    document.getElementById("item-panel").querySelector(".ping").addEventListener("click", icmpTryoutStart); //añadimos eventos de clic al item ping del panel
    document.getElementById("item-panel").querySelector(".dynrouting").addEventListener("click", showDynamicRoutingModal); //añadimos eventos de doble clic al item ping del panel
    document.getElementById("item-panel").querySelector(".settings").addEventListener("click", showOptions); //añadimos eventos de doble clic al item ping del panel
    document.getElementById("item-panel").querySelector(".traffic").addEventListener("click", showPacketTraffic); //añadimos eventos de clic al item de la tabla de tráfico

    //eventos de la terminal

    document.querySelector(".terminal-component").addEventListener("keydown", terminalKeyboard); //añadimos eventos de teclado al terminal
    document.querySelector(".terminal-component").addEventListener("mousedown", dragTerminal); //añadimos eventos de clic al terminalp
    document.querySelector(".terminal-component").addEventListener("click", clickTerminal); //añadimos eventos de clic al terminal
    document.querySelector(".terminal-input").addEventListener("keydown", sendCommand);
    document.querySelector(".terminal-output").addEventListener("click", clickTerminal);
    document.querySelector(".file-editor-error").addEventListener("mousedown", event => { event.stopPropagation(); });
    document.querySelector(".file-editor-error").addEventListener("mouseup", event => { event.stopPropagation(); });
    document.querySelector(".file-editor").addEventListener("mousedown", event => { event.stopPropagation(); });
    document.querySelector(".file-editor").addEventListener("mouseup", event => { event.stopPropagation(); });
    document.querySelector(".file-editor").addEventListener("click", event => { event.stopPropagation(); });
    document.querySelector(".file-editor").addEventListener("dragstart", event => { event.stopPropagation(); });
    document.querySelector(".file-editor").addEventListener("keydown", fileEditorKeyboard);

    //eventos del navegador

    document.querySelector(".browser-component").addEventListener("mousedown", dragBroswer);
    document.querySelector(".browser-component").querySelector(".control.close").addEventListener("click", closeBrowser);
    document.querySelector(".browser-component").querySelector(".control.minimize").addEventListener("click", minimizeBrowser);
    document.querySelector(".browser-component").querySelector(".control.maximize").addEventListener("click", maximizeBrowser);
    document.querySelector(".browser-component").querySelector(".address-input").addEventListener("keydown", browserSearch);
    document.querySelector(".browser-component").querySelector(".address-input").addEventListener("mousedown", event => { event.stopPropagation(); });
    document.querySelector(".browser-component").querySelector(".browser-content").addEventListener("mousedown", event => { event.stopPropagation(); });

    //eventos de la tabla de tráfico

    document.querySelector(".filter-traffic").querySelector("input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") filterPacketTraffic();
    });

    document.querySelector(".packet-traffic").querySelector(".filter-traffic").querySelector("button").addEventListener("click", filterPacketTraffic);

}

function getPanelItems() {
    fetch("./src/components/panel-items.json")
        .then(response => response.json())
        .then(data => {
            const panel = document.querySelector(".item-panel-elements");
            data.forEach(item => {
                const itemElement = document.createElement("article");
                itemElement.classList.add("item", item.name);
                itemElement.draggable = item.draggable;
                itemElement.ondragstart = dragStart;
                itemElement.innerHTML = `<img src="${item.image}" alt="${item.name}" draggable="${item.draggable}" style="width: ${item.size}; height: ${item.size};" />`;
                panel.appendChild(itemElement);
            });
        });
}

function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";
    const x = event.clientX;
    const y = event.clientY;
    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId,
        originx: x,
        originy: y
    }));
}

function closeAllModals() {
    const modals = document.querySelectorAll(".advanced-options-modal");
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
}

function removePropagationPingform() {
    const form = document.querySelector(".ping-form");
    const inputs = form.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("mousedown", event => {
            event.stopPropagation()
        });
    }
}

function downloadState() {
    const elemento = document.querySelector(".board");
    const contenidoHTML = elemento.innerHTML;
    const blob = new Blob([contenidoHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "contenido.html";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}

function loadState() {
    const archivoInput = document.getElementById("fileInput");
    if (archivoInput.files.length === 0) {
        alert("Por favor, selecciona un archivo.");
        return;
    }
    const archivo = archivoInput.files[0];
    const lector = new FileReader();
    lector.onload = function (event) {
        const contenido = event.target.result;
        document.querySelector(".board").innerHTML = contenido;
        setNewIndex();
        setTextContents();
        startLeaseTimers();
    };
    lector.readAsText(archivo);
}

function setNewIndex() {
    const itemsDropped = document.querySelectorAll(".item-dropped");
    const itemsText = document.querySelectorAll(".text-annotation");
    let indexes = [];

    itemsDropped.forEach(item => {
        let itemid = item.id;
        let itemindex = parseInt(itemid.split("-")[1]);
        if (!isNaN(itemindex)) indexes.push(itemindex);
    });

    itemsText.forEach(item => {
        let itemid = item.id;
        let itemindex = parseInt(itemid.split("-")[1]);
        if (!isNaN(itemindex)) indexes.push(itemindex);
    });

    itemIndex = (indexes.length > 0) ? Math.max(...indexes) + 1 : 1;

}

function setTextContents() {

    const itemsText = document.querySelectorAll(".text-annotation");

    for (let i = 0; i < itemsText.length; i++) {
        let text = itemsText[i].getAttribute("data-text");
        let input = itemsText[i].querySelector("input");
        input.value = text;
    }
}

function showTerminal(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const terminal = document.querySelector(".terminal-component");
    terminal.setAttribute("data-id", networkObject.id);
    terminal.style.display = "block";
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
}

function closeEveryThing(event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal").forEach(modal => { modal.style.display = "none"; });
        closeBrowser(event);
        document.querySelector(".packet-traffic").style.display = "none";
        closeTerminal(event);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

function changeSchema(event) {
    const schema = event.target.value;
    if (confirm("¿Estás seguro de que quieres cambiar el esquema?")) {
        if (schema === "net-one") {
            createBasicNetwork();
        }
    }
}

function icmpTryoutStart() {

    if (icmpTryoutToggle) {
        icmpTryoutEnd();
        return;
    }

    icmpTryoutToggle = true;

    //creamos el cursor
    const $cursor = document.createElement("article");
    const $cursorIcon = document.createElement("img");
    $cursor.classList.add("pack-cursor");
    $cursorIcon.src = "./assets/board/pack.svg";
    $cursor.appendChild($cursorIcon);
    document.body.appendChild($cursor);

    //ocultamos el cursor por defecto
    document.body.style.cursor = "none";

    //eventos del mouse
    document.addEventListener("mousemove", moveCursor);

    function moveCursor(event) {
        $cursor.style.top = `${event.clientY}px`;
        $cursor.style.left = `${event.clientX}px`;
    }

    function icmpTryoutEnd() {
        icmpTryoutToggle = false;
        const $cursor = document.querySelectorAll(".pack-cursor");
        $cursor.forEach(cursor => {cursor.removeEventListener("mousemove", moveCursor);});
        $cursor.forEach(cursor => {cursor.remove();});
        document.body.style.cursor = "default";
    }

}
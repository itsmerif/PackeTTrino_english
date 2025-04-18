async function itemPanel() {

    const $panel = document.createElement("section");
    const $itemsContainer = document.createElement("div");
    $panel.id = "item-panel";
    $panel.innerHTML = `<input type="file" id="fileInput" accept=".html" style="display: none;">`;
    $itemsContainer.classList.add("item-panel-elements");
    $itemsContainer.appendChild(dynamicRoutingButton());
    $panel.appendChild($itemsContainer);

    //pedimos los items del panel
    let panelItems;

    try {
        const response = await fetch("./src/components/panel-items.json");
        panelItems = await response.json();
    } catch (error) {
        console.log(error);
    }

    //agregamos los items del panel
    panelItems.forEach(panelItem => {
        const $itemElement = document.createElement("article");
        $itemElement.classList.add("item", panelItem.name);
        $itemElement.draggable = panelItem.draggable;
        $itemElement.ondragstart = dragStart;
        $itemElement.innerHTML = `
            <img src="${panelItem.image}" 
            alt="${panelItem.name}"
            draggable="${panelItem.draggable}" 
            style="width: ${panelItem.size}; height: ${panelItem.size};" />`;

        $itemElement.setAttribute("onmouseenter", `showTooltip("${panelItem.tooltip}", event)`);
        $itemElement.setAttribute("onmouseleave", `deleteTooltip(event)`);
        $itemsContainer.appendChild($itemElement);
    });

    //agregamos eventos
    $panel.querySelector("#fileInput").addEventListener("change", fileInputChangeHandler);
    $panel.querySelector(".ping").addEventListener("click", icmpTryoutStart);
    $panel.querySelector(".dynrouting").addEventListener("click", () => bodyComponent.render(DynamicRoutingMenu()));
    $panel.querySelector(".settings").addEventListener("click", generalOptionsHandler);
    $panel.querySelector(".traffic").addEventListener("click", showPacketTraffic);
    $panel.querySelector(".upload").addEventListener("click", () => $panel.querySelector("#fileInput").click());
    $panel.querySelector(".load").addEventListener("click", fileInputLoadHandler);
    $panel.querySelector(".download").addEventListener("click", downloadState);

    return $panel;

}

function fileInputChangeHandler(event) {
    let fileName = event.target.files[0].name;
    bodyComponent.render(popupMessage(`Archivo <em>${fileName}</em> cargado con éxito. Para mostrar el contenido, haz click en:`, "/assets/panel/load.svg"));
}

function fileInputLoadHandler() {

    const archivoInput = document.getElementById("fileInput");

    if (archivoInput.files.length === 0) {
        boardComponent.render(popupMessage("Por favor, sube un archivo primero."));
        return;
    }

    const fileName = archivoInput.files[0].name;

    bodyComponent.render(confirmPopup(`¿Deseas cargar el archivo ${fileName}?`, loadState));

}

function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId,
    }));

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
        $cursor.forEach(cursor => { cursor.removeEventListener("mousemove", moveCursor); });
        $cursor.forEach(cursor => { cursor.remove(); });
        document.body.style.cursor = "default";
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

}

function showTooltip(name, event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) return;
    $panelItem.appendChild(tooltip(name));
}

function deleteTooltip(event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) {
        $panelItem.querySelector(".tooltip").remove();
    }
}
function itemPanel() {

    const $panel = document.createElement("section");
    $panel.id = "item-panel";

    $panel.innerHTML = `
            <div class="file-options">
                <button onclick="downloadState()"> Descargar Esquema </button>
                <input type="file" id="fileInput" accept=".html" data-content="Seleccionar archivo">
                <button onclick="loadState()"> Cargar Esquema </button>
            </div>

            <div class="item-panel-elements">
                <article class="item dynrouting" draggable="false">
                <img src="./assets/panel/dynrouter.png" alt="dynrouting" draggable="false" style="width: 100%; height: 100%;">
                <div class="pulse"></div>
                <div class="radar-line"></div>
                </article>
            </div>
    `;

    fetch("./src/components/panel-items.json")
    .then(response => response.json())
    .then(data => {

        const container = $panel.querySelector(".item-panel-elements");
        
        data.forEach(item => {
            const itemElement = document.createElement("article");
            itemElement.classList.add("item", item.name);
            itemElement.draggable = item.draggable;
            itemElement.ondragstart = dragStart;
            itemElement.innerHTML = `<img src="${item.image}" alt="${item.name}" draggable="${item.draggable}" style="width: ${item.size}; height: ${item.size};" />`;
            container.appendChild(itemElement);
        });

        $panel.querySelector(".ping").addEventListener("click", icmpTryoutStart); //añadimos eventos de clic al item ping del panel
        $panel.querySelector(".dynrouting").addEventListener("click", showDynamicRoutingModal); //añadimos eventos de doble clic al item ping del panel
        $panel.querySelector(".settings").addEventListener("click", generalOptionsHandler); //añadimos eventos de doble clic al item ping del panel
        $panel.querySelector(".traffic").addEventListener("click", showPacketTraffic); //añadimos eventos de clic al item de la tabla de tráfico*/

    });

    return $panel;
    
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

    function setTextContents() {

        const itemsText = document.querySelectorAll(".text-annotation");
    
        for (let i = 0; i < itemsText.length; i++) {
            let text = itemsText[i].getAttribute("data-text");
            let input = itemsText[i].querySelector("input");
            input.value = text;
        }
    }

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
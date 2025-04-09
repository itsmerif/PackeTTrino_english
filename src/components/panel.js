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
        $panel.querySelector(".settings").addEventListener("click", showOptions); //añadimos eventos de doble clic al item ping del panel
        $panel.querySelector(".traffic").addEventListener("click", showPacketTraffic); //añadimos eventos de clic al item de la tabla de tráfico*/

    });

    return $panel;
    
}
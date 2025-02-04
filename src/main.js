//variables globales

let itemIndex = 0;


// funciones de inicio

function init() {
    getPanelItems();
}

function getPanelItems() {
    fetch("./components/panel-items.json")
        .then(response => response.json())
        .then(data => {
            const panel = document.getElementById("item-panel");
            data.forEach(item => {
                const itemElement = document.createElement("article");
                itemElement.classList.add("item", item.name);
                itemElement.draggable = true;
                itemElement.ondragstart = dragStart;
                itemElement.innerHTML = `<img src="${item.image}" alt="${item.name}" />`;
                panel.appendChild(itemElement);
            });
        });
}

function dragOverBoard(event) {
    event.preventDefault();
}

function dragStart(event) {
    const item = event.target.closest("img").alt;
    event.dataTransfer.setData("text/plain", item);
}

function dropItem(event) {
    const item = event.dataTransfer.getData("text/plain");
    const x = event.clientX;
    const y = event.clientY;
    switch (item) {
        case "pc":
            createPcObject(x, y);
            break;
        case "router":
            createRouterObject(x, y);
            break;
        case "switch":
            createSwitchObject(x, y);
            break;
        case "server":
            createServerObject(x, y);
            break;
        default:
            break;
    }
}

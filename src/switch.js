function createSwitchObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");

    networkObject.id = `switch-${itemIndex}`;

    networkObjectIcon.src = "./assets/switch.png";
    networkObjectIcon.alt = "switch";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);


    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));
    networkObject.addEventListener("drop", switchConn);


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

    if (item) {
        
        const itemType = JSON.parse(item).itemType;
        const itemId = JSON.parse(item).itemId;

        if (itemType === "item-dropped" && (itemId.startsWith("pc-") || itemId.startsWith("router-") || itemId.startsWith("server-"))) {
            console.log(itemType, itemId);
            console.log('valido')
        }

    }
}
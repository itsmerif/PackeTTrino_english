function createRouterObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");

    networkObjectIcon.src = "./assets/router.png";
    networkObjectIcon.alt = "router";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    networkObject.id = `pc-${itemIndex}`;
    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));
    networkObject.classList.add("item-dropped", "router");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    board.appendChild(networkObject);

    itemIndex++;

}
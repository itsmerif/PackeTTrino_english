function createServerObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");

    networkObjectIcon.src = "./assets/server.png";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    networkObject.id = `server-${itemIndex}`;
    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));
    networkObject.classList.add("item-dropped", "server");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    board.appendChild(networkObject);

    itemIndex++;

}
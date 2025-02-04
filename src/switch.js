function createSwitchObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");

    networkObjectIcon.src = "./assets/switch.png";
    networkObjectIcon.alt = "switch";
    networkObjectIcon.draggable = false;
    networkObject.appendChild(networkObjectIcon);

    networkObject.classList.add("item-dropped", "switch");
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    board.appendChild(networkObject);

}
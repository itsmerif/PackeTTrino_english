function createTextObject(x, y) {

    const board = document.querySelector(".board");
    const textObject = document.createElement("article");

    textObject.id = "text-" + itemIndex;
    textObject.classList.add("text-annotation");
    textObject.style.left = `${x}px`;
    textObject.style.top = `${y}px`;
    textObject.innerHTML = `<input type="text">`;
    textObject.draggable = true;
    textObject.addEventListener("dragstart", event => BoardItemDragStartText(event));
    board.appendChild(textObject);
    itemIndex++;

}

function BoardItemDragStartText(event) {

    const textObject = event.target.closest(".text-annotation");
    
    //obtengo TODOS los datos del elemento

    const textObjectid = textObject.id;
    const ip = textObject.getAttribute("data-ip");
    const netmask = textObject.getAttribute("data-netmask");
    const network = textObject.getAttribute("data-network");
    const mac = textObject.getAttribute("data-mac");
    const gateway = textObject.getAttribute("data-gateway");
    const itemType = "item-dropped";
    const x = textObject.style.left;   
    const y = textObject.style.top;
    
    //los transformamos en un string

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: textObjectid,
        ip: ip,
        netmask: netmask,
        network: network,
        mac: mac,
        gateway: gateway,
        originx: x,
        originy: y
    }));

}
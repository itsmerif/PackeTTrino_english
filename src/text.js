function createTextObject(x, y) {

    const board = document.querySelector(".board");
    const textObject = document.createElement("article");
    const input = document.createElement("input");

    textObject.id = "text-" + itemIndex;
    textObject.classList.add("text-annotation");
    textObject.style.left = `${x}px`;
    textObject.style.top = `${y}px`;
    textObject.draggable = true;
    textObject.addEventListener("dragstart", event => BoardItemDragStartText(event));

    input.type = "text";
    input.addEventListener("input", autoExtendText);
    textObject.appendChild(input);

    board.appendChild(textObject);
    itemIndex++;

}

function autoExtendText() {
    const container = this.parentElement;
    const input = container.querySelector("input");
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.whiteSpace = 'pre';
    temp.style.font = window.getComputedStyle(input).font;
    temp.textContent = this.value || 'W';  
    document.body.appendChild(temp);
    const width = temp.getBoundingClientRect().width;
    document.body.removeChild(temp); 
    const newWidth = Math.max(40, width + 20);
    container.style.width = `${newWidth}px`;
    container.style.marginLeft = `-${newWidth/2}px`;
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

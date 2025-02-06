function dragOverBoard(event) {
    event.preventDefault();
}

function dropItem(event) {
    const item = event.dataTransfer.getData("json");
    const itemType = JSON.parse(item).itemType;
    const itemId = JSON.parse(item).itemId;
    const x = event.clientX;    
    const y = event.clientY;

    if (itemType === "item") {

        switch (itemId) {
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
                alert("Objeto en construcción");
                //createServerObject(x, y);
                break;
            default:
                alert("Error: Tipo de objeto no reconocido");
                break;
        }

    } else if (itemType === "item-dropped") {
        const networkObject = document.getElementById(itemId);
        networkObject.style.left = `${x}px`;
        networkObject.style.top = `${y}px`;
    }
}
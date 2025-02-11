function dragOverBoard(event) {
    event.preventDefault();
}

function BoardItemDragStart(event) {

    const networkObject = event.target.closest(".item-dropped");
    
    //obtengo TODOS los datos del elemento

    const networkObjectid = networkObject.id;
    const ip = networkObject.getAttribute("data-ip");
    const netmask = networkObject.getAttribute("data-netmask");
    const network = networkObject.getAttribute("data-network");
    const mac = networkObject.getAttribute("data-mac");
    const gateway = networkObject.getAttribute("data-gateway");
    const itemType = "item-dropped";
    const x = networkObject.style.left;   
    const y = networkObject.style.top;
    
    //los transformamos en un string

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectid,
        ip: ip,
        netmask: netmask,
        network: network,
        mac: mac,
        gateway: gateway,
        originx: x,
        originy: y
    }));

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
            case "dhcpserver":
                createDhcpServerObject(x, y);
                break;
            case "text":
                //alert("Objeto en construcción");
                createTextObject(x, y);
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

function deleteItem(event) {
    
    event.stopPropagation();

    let networkObject = event.target.closest(".item-dropped");

    if (!networkObject) {
        networkObject = event.target.closest(".text-annotation");
    }

    networkObject.remove();
}
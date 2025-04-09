let pcs = {};
let routers = {};
let switches = {};
let servers = {};

function dragOverBoard(event) {
    event.preventDefault();
}

function BoardItemDragStart(event) {

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectid = $networkObject.id;
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const mac = $networkObject.getAttribute("data-mac");
    const gateway = $networkObject.getAttribute("data-gateway");
    const itemType = "item-dropped";
    const x = $networkObject.style.left;
    const y = $networkObject.style.top;

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectid,
        ip: ip,
        netmask: netmask,
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
    const initialX = JSON.parse(item).originx;
    const initialY = JSON.parse(item).originy;
    const $board = document.querySelector(".board");
    const boardRect = $board.getBoundingClientRect();
    let x = event.clientX - boardRect.left;
    let y = event.clientY - boardRect.top;
    let dx = x - parseInt(initialX);
    let dy = y - parseInt(initialY);

    const itemCreators = {
        "pc": () => createPcObject(x, y),
        "router": () => createRouterObject(x, y),
        "switch": () => createSwitchObject(x, y),
        "dhcpserver": () => createDhcpServerObject(x, y),
        "dhcprelay": () => createDhcpRelayObject(x, y),
        "dnsserver": () => createDnsServerObject(x, y),
        "text": () => createTextObject(x, y)
    }

    if (itemType === "item") itemCreators[itemId] ? itemCreators[itemId]() : popupMessage("Error: Tipo de objeto no reconocido");
    
    if (itemType === "item-dropped") {

        const networkObject = document.getElementById(itemId);

        //compruebo si existe alguna conexión
        
        if (itemId.startsWith("router-")) {

            const conns = [ networkObject.getAttribute("data-switch-enp0s3"), networkObject.getAttribute("data-switch-enp0s8"), networkObject.getAttribute("data-switch-enp0s9") ];
            
            if ( conns[0] === "" && conns[1] === "" && conns[2] === "" ) {
                [x,y] = checkObjectClip(x, y);
                networkObject.style.left = `${x}px`;
                networkObject.style.top = `${y}px`;
            }

        } else if (itemId.startsWith("switch-")) {

            [x,y] = checkObjectClip(x, y);
            networkObject.style.left = `${x}px`;
            networkObject.style.top = `${y}px`;
            
        }else {

            const conn = networkObject.getAttribute("data-switch") || "";

            if (conn === "") {
                [x,y] = checkObjectClip(x, y);
                networkObject.style.left = `${x}px`;
                networkObject.style.top = `${y}px`;
            }

        }
    }
}

function deleteItem(event) {

    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");

    if ($networkObject.id.startsWith("router-")) {
        if (!$networkObject.getAttribute("data-switch-enp0s3") && !$networkObject.getAttribute("data-switch-enp0s8") && !$networkObject.getAttribute("data-switch-enp0s9")) $networkObject.remove();
        else popupMessage("Error: No se puede eliminar un router con conexiones.");
    } else if ($networkObject.id.startsWith("switch-")) {
        if ($networkObject.querySelector(".mac-table").querySelector("table").querySelectorAll("tr").length === 1 ) $networkObject.remove();
        else popupMessage("Error: No se puede eliminar un switch con dispositivos conectados.");
    } else {
        if (!$networkObject.getAttribute("data-switch")) $networkObject.remove();
        else popupMessage("Error: No se puede eliminar un dispositivo con conexiones.");       
    }

}

function getConns(networkObjectId) {
    const $lines = document.querySelectorAll("line");
    const $circles = document.querySelectorAll("circle");
    let finalLines = [];
    let finalCircles = [];

    for (let i = 0; i < $lines.length; i++) {
        let conn = $lines[i];
        if (conn.getAttribute("end-start") === networkObjectId) {
            finalLines.push(conn);
        }
    }

    for (let i = 0; i < $circles.length; i++) {
        let conn = $circles[i];
        if (conn.getAttribute("end-start") === networkObjectId) {
            finalCircles.push(conn);
        }
    }

    return [finalLines, finalCircles];
}

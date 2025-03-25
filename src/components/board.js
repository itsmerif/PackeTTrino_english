let pcs = {};
let routers = {};
let switches = {};
let servers = {};

function dragOverBoard(event) {
    event.preventDefault();
}

function BoardItemDragStart(event) {

    const networkObject = event.target.closest(".item-dropped");

    //obtengo TODOS los datos del elemento

    const networkObjectid = networkObject.id;
    const ip = networkObject.getAttribute("data-ip");
    const netmask = networkObject.getAttribute("data-netmask");
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
    const x = event.clientX;
    const y = event.clientY;
    const dx = x - parseInt(initialX);
    const dy = y - parseInt(initialY);
    const $board = document.querySelector(".board");

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
            case "dhcprelay":
                createDhcpRelayObject(x, y);
                break;
            case "dnsserver":
                createDnsServerObject(x, y);
                break;
            case "text":
                createTextObject(x, y);
                break;
            default:
                alert("Error: Tipo de objeto no reconocido");
                break;
        }
        
        return;
    }
    
    if (itemType === "item-dropped") {

        const networkObject = document.getElementById(itemId);

        //compruebo si existe alguna conexión
        
        if (itemId.startsWith("router-")) {

            const conns = [ networkObject.getAttribute("data-switch-enp0s3"), networkObject.getAttribute("data-switch-enp0s8"), networkObject.getAttribute("data-switch-enp0s9") ];
            
            if ( conns[0] === "" && conns[1] === "" && conns[2] === "" ) {
                networkObject.style.left = `${x}px`;
                networkObject.style.top = `${y}px`;
            }

        } else if (itemId.startsWith("switch-")) {

            networkObject.style.left = `${x}px`;
            networkObject.style.top = `${y}px`;
            moveConns(itemId, dx, dy);
            
        }else {

            const conn = networkObject.getAttribute("data-switch") || "";

            if (conn === "") {
                networkObject.style.left = `${x}px`;
                networkObject.style.top = `${y}px`;
            }

        }
    }
}

function deleteItem(event) {

    event.stopPropagation();

    let networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");

    if (!networkObject.id.startsWith("router-")) {

        if (networkObject.id.startsWith("switch-")) {

            if (networkObject.querySelector(".mac-table").querySelector("table").querySelectorAll("tr").length === 1 ) {
                networkObject.remove();
            }

        } else {

            if (!networkObject.getAttribute("data-switch")) {
                networkObject.remove();
            }
            
        }

    } else {

        if (!networkObject.getAttribute("data-switch-enp0s3") && !networkObject.getAttribute("data-switch-enp0s8") && !networkObject.getAttribute("data-switch-enp0s9")) {
            networkObject.remove();
        }

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

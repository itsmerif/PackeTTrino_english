/**THIS FUNCTION GENERATES A BOARD NODE ELEMENT*/
function itemBoard() {

    const $board = document.createElement("section");

    $board.classList.add("board");
    $board.setAttribute("ondragover", "dragOverBoard(event)");
    $board.setAttribute("ondrop", "dropItemOverBoard(event)");
    $board.setAttribute("onclick", "closeAllAdvOptsModals()");

    $board.innerHTML = `
        <svg ondragover="dragOverBoard(event)" id="svg-board" rope-start="startId" rope-end="endId"
        preserveAspectRatio="none" width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
        </svg>
    `;

    return $board
}

/**THIS FUNCTION MANAGES THE DRAG OVER OF THE ELEMENT*/
function dragOverBoard(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
}

/**THIS FUNCTION MANAGES THE DRAG START OF AN ELEMENT THAT IS ABOVE THE BOARD ELEMENT*/
function BoardItemDragStart(event) {

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectid = $networkObject.id;
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const mac = $networkObject.getAttribute("mac-enp0s3");
    const itemType = "item-dropped";
    const x = $networkObject.style.left;
    const y = $networkObject.style.top;

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectid,
        ip: ip,
        netmask: netmask,
        mac: mac,
        originx: x,
        originy: y
    }));
}

/**THIS FUNCTION MANAGES THE DROP OF AN ELEMENT ON THE BOARD ELEMENT*/
function dropItemOverBoard(event) {
    
    event.preventDefault();

    /*esto solo funciona en algunos navegadores
    if (event.dataTransfer.files.length > 0) {
        const files = event.dataTransfer.files;
        loadState(files);
        return;
    }*/

    const item = event.dataTransfer.getData("json");
    const itemType = JSON.parse(item).itemType;
    const itemId = JSON.parse(item).itemId;
    const $board = document.querySelector(".board");
    const $networkObject = document.getElementById(itemId);
    const boardRect = $board.getBoundingClientRect();
    let x = event.clientX - boardRect.left;
    let y = event.clientY - boardRect.top;

    const boardItemRender = {
        "pc": () => PcObject(x, y),
        "router": () => RouterObject(x, y),
        "switch": () => SwitchObject(x, y),
        "dhcpserver": () => DhcpServerObject(x, y),
        "dhcprelay": () => DhcpRelayObject(x, y),
        "dnsserver": () => DnsServerObject(x, y),
        "text": () => TextObject(x, y),
    }

    if (itemType === "item" && boardItemRender[itemId]) { //<-- This is a panel item and there is a function to render it
        let $newItem = boardItemRender[itemId]();
        //The drag event is added and release on a switch
        if (!itemId.startsWith("switch")) $newItem.setAttribute("ondrop", `dropPackageOverItem(event); dropSwitchOverItem(event);`);
        boardComponent.render($newItem);
        itemIndex++; //<-- increment the item index to generate a new unique ID
    }

    if (itemType === "item-dropped" && !isConnected(itemId)) { //<-- This is an item that has been dragged and has no connection
        [x, y] = checkObjectClip(x, y);
        $networkObject.style.left = `${x}px`;
        $networkObject.style.top = `${y}px`;
    }

}

/**THIS FUNCTION REMOVES A NETWORK ELEMENT FROM THE BOARD */

function deleteItem(event) {

    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");
    const interfaces = getInterfaces($networkObject.id);

    if (!isConnected($networkObject.id)) {
        //Remove the device information stored in the buffers
        delete buffer[$networkObject.id];
        delete httpBuffer[$networkObject.id];
        delete dhcpOfferBuffer[$networkObject.id];
        delete tcpBuffer[$networkObject.id];
        delete traceBuffer[$networkObject.id];
        //Remove the background processes associated with the device
        clearInterval(serverLeaseTimers[$networkObject.id]);
        clearInterval(clientLeaseTimers[`${$networkObject.id}-${interfaces[0]}`]);
        delete serverLeaseTimers[$networkObject.id];
        delete clientLeaseTimers[`${$networkObject.id}-${interfaces[0]}`];
        $networkObject.remove();
    }else {
        boardComponent.render(popupMessage(`<span>Error:</span>Cannot remove a device with connections.`));
    }

}

/**THIS FUNCTION MANAGES THE DROP OF A PACKET ON A NETWORK ELEMENT ON THE BOARD */
function dropPackageOverItem(event) {

    const package = event.dataTransfer.getData("json");
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const itemType = JSON.parse(package).itemType;
    const itemId = JSON.parse(package).itemId;
    const packages = ["isc-dhcp-server", "isc-dhcp-client", "isc-dhcp-relay", "bind9", "apache2"];
    
    if (itemType !== "item") return; //<-- We prevent the installation of packages that are not items
    if (!packages.includes(itemId)) return; //<-- We prevent the installation of packages other than the ones we want

    try {
        dpkg(networkObjectId, "install", itemId);
        boardComponent.render(popupMessage(`Package ${itemId} was successfully installed.`));
    }catch(error) {
        boardComponent.render(popupMessage(error.message));
    }

}

/**THIS FUNCTION MANAGES THE DROP OF A SWITCH ONTO A NETWORK ELEMENT ON THE BOARD*/
function dropSwitchOverItem(event) {
    
    const switchInfo = event.dataTransfer.getData("json");
    const switchId = JSON.parse(switchInfo).itemId;

    if (!switchId.startsWith("switch-")) return;

    const switchX = JSON.parse(switchInfo).originx;
    const switchY = JSON.parse(switchInfo).originy;
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const networkObjectX = $networkObject.style.left;
    const networkObjectY = $networkObject.style.top;
    const availableInterface = getAvailableInterface(networkObjectId);

    if (availableInterface) {
        CableObject(networkObjectX, networkObjectY, switchX, switchY, networkObjectId, switchId, availableInterface);
        addSwitchPort(switchId, networkObjectId);
        $networkObject.setAttribute(`data-switch-${availableInterface}`, switchId);
        if(!getAvailableInterface(networkObjectId)) $networkObject.querySelector("img").draggable = false;
    }

}

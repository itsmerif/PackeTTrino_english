/**ESTA FUNCION GENERA UN ELEMENTO NODO TABLERO */
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

/**ESTA FUNCION GESTIONA EL DRAG OVER DE EL ELEMENTO  */
function dragOverBoard(event) {
    event.preventDefault();
}

/**ESTA FUNCION GESTIONA EL DRAG START DE UN ELEMENTO QUE ESTÉ SOBRE EL ELEMENTO TABLERO */
function BoardItemDragStart(event) {

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectid = $networkObject.id;
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const mac = $networkObject.getAttribute("mac-enp0s3");
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

/**ESTA FUNCION GESTIONA EL DROP DE UN ELEMENTO SOBRE EL ELEMENTO TABLERO */
function dropItemOverBoard(event) {

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

    if (itemType === "item" && boardItemRender[itemId]) {
        let $newItem = boardItemRender[itemId]();
        if (!itemId.startsWith("switch")) $newItem.setAttribute("ondrop", `dropPackageOverItem(event); dropSwitchOverItem(event);`);
        boardComponent.render($newItem);
    }

    if (itemType === "item-dropped" && !isConnected(itemId)) {
        [x, y] = checkObjectClip(x, y);
        $networkObject.style.left = `${x}px`;
        $networkObject.style.top = `${y}px`;
    }

}

/**ESTA FUNCION ELIMINA UN ELEMENTO DE RED DEL TABLERO */
function deleteItem(event) {

    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");

    if (!isConnected($networkObject.id)) {
        //eliminamos la informacion del dispositivo guardada en los buffers
        delete buffer[$networkObject.id];
        delete browserBuffer[$networkObject.id];
        delete dhcpOfferBuffer[$networkObject.id];
        delete tcpBuffer[$networkObject.id];
        delete traceBuffer[$networkObject.id];
        //eliminamos los procesos en segundo plano asociados al dispositivo
        clearInterval(serverLeaseTimers[$networkObject.id]);
        clearInterval(clientLeaseTimers[$networkObject.id]);
        delete serverLeaseTimers[$networkObject.id];
        delete clientLeaseTimers[$networkObject.id];
        $networkObject.remove();
    }else {
        boardComponent.render(popupMessage(`<span>Error: </span>No se puede eliminar un dispositivo con conexiones.`));
    }

}

/**ESTA FUNCION GESTIONA EL DROP DE UN PAQUETE SOBRE UN ELEMENTO DE RED EN EL TABLERO */
function dropPackageOverItem(event) {

    const package = event.dataTransfer.getData("json");
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const itemType = JSON.parse(package).itemType;
    const itemId = JSON.parse(package).itemId;
    const packages = ["isc-dhcp-server", "isc-dhcp-client", "isc-dhcp-relay", "bind9", "apache2"];
    
    if (itemType !== "item") return;
    if (!packages.includes(itemId)) return;

    try {
        dpkg(networkObjectId, "install", itemId);
        boardComponent.render(popupMessage(`Se instaló el paquete ${itemId} con éxito.`));
    }catch(error) {
        boardComponent.render(popupMessage(error.message));
    }

}

/**ESTA FUNCION GESTIONA EL DROP DE UN SWITCH SOBRE UN ELEMENTO DE RED EN EL TABLERO */
function dropSwitchOverItem(event) {
    
    const switchInfo = event.dataTransfer.getData("json");
    const switchId = JSON.parse(switchInfo).itemId;

    if (!switchId.startsWith("switch-")) return;

    const $switchObject = document.getElementById(switchId);
    const switchX = JSON.parse(switchInfo).originx;
    const switchY = JSON.parse(switchInfo).originy;
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const networkObjectX = $networkObject.style.left;
    const networkObjectY = $networkObject.style.top;
    const availableInterface = getAvailableInterface(networkObjectId);

    if (availableInterface) {
        CableObject(networkObjectX, networkObjectY, switchX, switchY, networkObjectId, switchId, availableInterface);
        saveConn(switchId, networkObjectId);
        $networkObject.setAttribute(`data-switch-${availableInterface}`, switchId);
        if(!getAvailableInterface(networkObjectId)) $networkObject.querySelector("img").draggable = false;
    }

}
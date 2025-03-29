function showAdvancedOptions(event) {

    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height")); //altura del tablero
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const boardRect = $board.getBoundingClientRect();
    const networkObject = event.target.closest(".item-dropped") || event.target.closest(".text-annotation");
    const $modal = networkObject.querySelector(".advanced-options-modal");
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;

    if (y < boardHeight / 2 && x < boardWidth / 2) {
        $modal.style.top = "30%";
        $modal.style.bottom = "";
        $modal.style.left = "50%";
        $modal.style.right = "";
    }

    if (y < boardHeight / 2 && x > boardWidth / 2) {
        $modal.style.top = "30%";
        $modal.style.bottom = "";
        $modal.style.left = "";
        $modal.style.right = "30%";
    }

    if (y > boardHeight / 2 && x < boardWidth / 2) {
        $modal.style.top = "";
        $modal.style.bottom = "30%";
        $modal.style.left = "30%";
        $modal.style.right = "";
    }

    if (y > boardHeight / 2 && x > boardWidth / 2) {
        $modal.style.top = "";
        $modal.style.bottom = "30%";
        $modal.style.left = "";
        $modal.style.right = "30%";
    }

    $modal.style.display = "flex";
}

function showObjectModalTable(event, class_name) {
    
    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const $networkObject = event.target.closest(".item-dropped")
    const $advancedOptionsModal = $networkObject.querySelector(".advanced-options-modal");
    const $Table = $networkObject.querySelector("." + class_name);
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height"));
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const objectX = parseInt($networkObject.style.left);
    const objectY = parseInt($networkObject.style.top);

    //obtenemos el ancho y alto del elemento

    $Table.style.display = "flex";
    let currentTableWidth = parseInt($Table.offsetWidth);
    let currentTableHeight = parseInt($Table.offsetHeight);
    $Table.style.display = "none";

    //inicializamos la posicion del modal tabla arp

    $Table.style.left = "50%";
    $Table.style.top = "50%";

    //dependiendo del diffX y diffY, cambiamos la posicion del modal

    let tableLeftSide = objectX - currentTableWidth / 2;
    let tableRightSide = objectX + currentTableWidth / 2;
    let tableTopSide = objectY - currentTableHeight / 2;
    let tableBotSide = objectY + currentTableHeight / 2;

    if ( tableLeftSide < 0) { //el modal acaba oculto por la izquierda
        let diffLeftSide = parseInt(0 - tableLeftSide);
        $Table.style.left = `calc(50% + ${Math.abs(diffLeftSide)}px + 5px)`;
    }

    if (tableRightSide > boardWidth) { //el modal acaba oculto por la derecha
        let diffRightSide = parseInt(tableRightSide - boardWidth);
        $Table.style.left = `calc(50% - ${Math.abs(diffRightSide)}px - 5px)`;
    }

    if (tableTopSide < 0) { //el modal acaba oculto por arriba
        let diffTopSide = parseInt(0 - tableTopSide);
        $Table.style.top = `calc(50% + ${Math.abs(diffTopSide)}px + 5px)`;
    }

    if (tableBotSide > boardHeight) { //el modal acaba oculto por abajo
        let diffBotSide = parseInt(tableBotSide - boardHeight);
        $Table.style.top = `calc(50% - ${Math.abs(diffBotSide)}px - 5px)`;
    }

    $advancedOptionsModal.style.display = "none";
    $Table.style.display = "flex";

}

function closeObjectModalTable(event, class_name) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $Table = $networkObject.querySelector("." + class_name);
    $Table.style.display = "none";
}

function showARPTable(event) {
    showObjectModalTable(event, "arp-table");
}

function showDhcpTable(event) {
    showObjectModalTable(event, "dhcp-table");
}

function showDnsTable(event) {
    showObjectModalTable(event, "dns-table");
}

function showRoutingTable(event) {
    showObjectModalTable(event, "routing-table");
}

function showRouterFirewallTable(event) {
    showObjectModalTable(event, "firewall-table");
}

function closeDhcpTable(event) {
    closeObjectModalTable(event, "dhcp-table");
}

function closeRoutingTable(event) {
    closeObjectModalTable(event, "routing-table");
}

function closeFirewallTable(event) {
    closeObjectModalTable(event, "firewall-table");
}

function closeARPTable(event) {
    closeObjectModalTable(event, "arp-table");
}

function closeDnsTable(event) {
    closeObjectModalTable(event, "dns-table");
}

function createPacketIndicator(id) {

    const $networkObject = document.getElementById(id)
    const $board = document.querySelector(".board");

    //creamos el indicator
    const $indicator = document.createElement("article");
    const $indicatorIcon = document.createElement("img");
    $indicator.classList.add("pack-cursor");
    $indicatorIcon.src = "./assets/board/svgs/pack.svg";
    $indicator.appendChild($indicatorIcon);

    //obtenermos las coordenadas del objeto
    const x = parseInt($networkObject.style.left);
    const y = parseInt($networkObject.style.top);
    $indicator.style.left = `${x}px`;
    $indicator.style.top = `${y}px`;
    
    //agregamos el indicator al tablero
    $board.appendChild($indicator);
}

async function icmpTryoutProcess(id) {

    const $networkObject = document.getElementById(id);
    const $board = document.querySelector(".board");

    if (icmpTryoutObject1 === "") {
        
        icmpTryoutObject1Ip = $networkObject.getAttribute("data-ip") ||
        $networkObject.getAttribute("ip-enp0s3") ||
        $networkObject.getAttribute("ip-enp0s8") ||
        $networkObject.getAttribute("ip-enp0s9");

        if (!icmpTryoutObject1Ip) {
            popupMessage("<span>Error: </span>No se ha encontrado la IP del objeto " + id);
            return;
        }
        
        icmpTryoutObject1 = id;
        createPacketIndicator(id);
        return;
    }


    icmpTryoutObject2Ip = $networkObject.getAttribute("data-ip") ||
    $networkObject.getAttribute("ip-enp0s3") ||
    $networkObject.getAttribute("ip-enp0s8") ||
    $networkObject.getAttribute("ip-enp0s9");

    if (!icmpTryoutObject2Ip) {
        popupMessage("<span>Error: </span>No se ha encontrado la IP del objeto " + id);
        return;
    }

    icmpTryoutObject2 = id;
    createPacketIndicator(id);
    await pingSim(icmpTryoutObject1Ip, icmpTryoutObject2Ip);
    $board.querySelectorAll(".pack-cursor").forEach(cursor => {cursor.remove();});
    icmpTryoutObject1 = "";
    icmpTryoutObject2 = "";
}
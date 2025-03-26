function showAdvancedOptions(event) {

    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height")); //altura del tablero
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const boardRect = $board.getBoundingClientRect();
    const networkObject = event.target.closest(".item-dropped")
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
    const boardRect = $board.getBoundingClientRect();
    const objectX = parseInt($networkObject.style.left);
    const objectY = parseInt($networkObject.style.top);
    let currentTableHeight;
    let currentTableWidth;
    let tableLeftSide;
    let tableRightSide;
    let tableTopSide;
    let tableBotSide;
    let diffLeftSide;
    let diffRightSide;
    let diffTopSide;
    let diffBotSide;

    //obtenemos el ancho y alto del elemento

    $Table.style.display = "flex";
    currentTableWidth = parseInt($Table.offsetWidth);
    currentTableHeight = parseInt($Table.offsetHeight);
    $Table.style.display = "none";

    //inicializamos la posicion del modal tabla arp

    $Table.style.left = "50%";
    $Table.style.top = "50%";

    //dependiendo del diffX y diffY, cambiamos la posicion del modal

    tableLeftSide = objectX - currentTableWidth / 2;
    tableRightSide = objectX + currentTableWidth / 2;
    tableTopSide = objectY - currentTableHeight / 2;
    tableBotSide = objectY + currentTableHeight / 2;

    if ( tableLeftSide < 0) { //el modal acaba oculto por la izquierda
        diffLeftSide = parseInt(0 - tableLeftSide);
        $Table.style.left = `calc(50% + ${Math.abs(diffLeftSide)}px + 5px)`;
    }

    if (tableRightSide > boardWidth) { //el modal acaba oculto por la derecha
        diffRightSide = parseInt(tableRightSide - boardWidth);
        $Table.style.left = `calc(50% - ${Math.abs(diffRightSide)}px - 5px)`;
    }

    if (tableTopSide < 0) { //el modal acaba oculto por arriba
        diffTopSide = parseInt(0 - tableTopSide);
        $Table.style.top = `calc(50% + ${Math.abs(diffTopSide)}px + 5px)`;
    }

    if (tableBotSide > boardHeight) { //el modal acaba oculto por abajo
        let diffBotSide = parseInt(tableBotSide - boardHeight);
        $Table.style.top = `calc(50% - ${Math.abs(diffBotSide)}px - 5px)`;
    }

    $advancedOptionsModal.style.display = "none";
    $Table.style.display = "flex";

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
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".firewall-table");
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
    table.style.display = "flex";
}

function closeDhcpTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".dhcp-table");
    table.style.display = "none";
}

function closeRoutingTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".routing-table");
    table.style.display = "none";
}

function closeFirewallTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".firewall-table");
    table.style.display = "none";
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    table.style.display = "none";
}

function closeDnsTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".dns-table");
    table.style.display = "none";
}
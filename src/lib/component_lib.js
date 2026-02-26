/**This class defines a component token from a node. It has methods such as render, event, etc.*/
class componentToken {

    constructor(element) {
        this.element = element;
    }
    
    async render(...componentes) {
        const $elements = document.querySelectorAll(this.element);
        componentes = await Promise.all(componentes);
        $elements.forEach($element => {
            componentes.forEach(componente => $element.appendChild(componente));
        });
    }

    event(evento, resultado) {
        const $elements = document.querySelectorAll(this.element);    
        $elements.forEach( $element => $element.addEventListener(evento, resultado));
    }

}

/**This function receives the position of an object and returns new positions if the object is clipped outside the artboard. */
function checkObjectClip(x, y) { 

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height"));
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const objectWidth = 80;
    const objectHeight = 80;
    const spareSpace = 10;
    let newX = x;
    let newY = y;

//calculate the object's position based on its position on the board
    
    let objectLeft = (x - objectWidth / 2);
    let objectRight = (x + objectWidth / 2);
    let objectTop = (y - objectHeight / 2);
    let objectBot = (y + objectHeight / 2);

    if (objectLeft < 0) { //the object ends up hidden on the left
        let diffLeft = Math.abs(objectLeft);
        newX = x + diffLeft + spareSpace;
    }

    if (objectRight > boardWidth) { //The object ends up hidden on the right
        let diffRight = Math.abs(objectRight - boardWidth);
        newX = x - diffRight - spareSpace;
    }

    if (objectTop < 0) { //the object ends up hidden from above
        let diffTop = Math.abs(objectTop);
        newY = y + diffTop + spareSpace;
    }

    if (objectBot > boardHeight) { //the object ends up hidden below
        let diffBot = Math.abs(objectBot - boardHeight);
        newY = y - diffBot - spareSpace;
    }

    return [newX, newY];
}

/**THIS FUNCTION DISPLAYS THE ADVANCED OPTIONS OF AN OBJECT*/
function showAdvancedOptions(event) {

    event.preventDefault();
    event.stopPropagation();

    const $board = document.querySelector(".board");
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height")); //board height
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

    if (darkMode) $modal.classList.add("modal-dark-mode")
    else $modal.classList.remove("modal-dark-mode");

    $modal.style.display = "flex";
}

/**THIS FUNCTION DISPLAYS A MODAL OF AN OBJECT, RECALCULATING THE MODAL'S POSITIONS BASED ON THE OBJECT'S POSITION*/
function showObjectModalTable(event, selector) {
    
    event.preventDefault();
    event.stopPropagation();
    
    const $board = document.querySelector(".board");
    const $networkObject = event.target.closest(".item-dropped")
    const $advancedOptionsModal = $networkObject.querySelector(".advanced-options-modal");
    const $Table = $networkObject.querySelector(selector);
    const boardProperties = window.getComputedStyle($board, null);
    const boardHeight = parseInt(boardProperties.getPropertyValue("height"));
    const boardWidth = parseInt(boardProperties.getPropertyValue("width"));
    const objectX = parseInt($networkObject.style.left);
    const objectY = parseInt($networkObject.style.top);

//We get the element's width and height

    $Table.style.display = "flex";
    let currentTableWidth = parseInt($Table.offsetWidth);
    let currentTableHeight = parseInt($Table.offsetHeight);
    $Table.style.display = "none";

    //Initialize the modal's position (table arp)

    $Table.style.left = "50%";
    $Table.style.top = "50%";

//Depending on the diffX and diffY values, change the modal's position


    let tableLeftSide = objectX - currentTableWidth / 2;
    let tableRightSide = objectX + currentTableWidth / 2;
    let tableTopSide = objectY - currentTableHeight / 2;
    let tableBotSide = objectY + currentTableHeight / 2;

    if ( tableLeftSide < 0) { //The modal ends up hidden on the left
        let diffLeftSide = parseInt(0 - tableLeftSide);
        $Table.style.left = `calc(50% + ${Math.abs(diffLeftSide)}px + 5px)`;
    }

    if (tableRightSide > boardWidth) { //The modal ends up hidden on the right
        let diffRightSide = parseInt(tableRightSide - boardWidth);
        $Table.style.left = `calc(50% - ${Math.abs(diffRightSide)}px - 5px)`;
    }

    if (tableTopSide < 0) { //The modal ends up hidden on the top
        let diffTopSide = parseInt(0 - tableTopSide);
        $Table.style.top = `calc(50% + ${Math.abs(diffTopSide)}px + 5px)`;
    }

    if (tableBotSide > boardHeight) { //The modal ends up hidden at the bottom
        let diffBotSide = parseInt(tableBotSide - boardHeight);
        $Table.style.top = `calc(50% - ${Math.abs(diffBotSide)}px - 5px)`;
    }

    $advancedOptionsModal.style.display = "none";

    if (darkMode) $Table.classList.add("dark-mode")
    else $Table.classList.remove("dark-mode");

    $Table.style.display = "flex";

}

/**THIS FUNCTION HIDES A MODAL OF AN OBJECT*/
function closeObjectModalTable(event, selector) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $Table = $networkObject.querySelector(selector);
    $Table.style.display = "none";
}

/**THIS FUNCTION CREATES A PACKAGE INDICATOR ON AN OBJECT*/
function createPacketIndicator(id) {

    const $networkObject = document.getElementById(id)
    const $board = document.querySelector(".board");

   //Create the indicator
    const $indicator = document.createElement("article");
    const $indicatorIcon = document.createElement("img");
    $indicator.classList.add("pack-cursor");
    $indicatorIcon.src = "./assets/board/pack.svg";
    $indicator.appendChild($indicatorIcon);

    //Get the object's coordinates
    const x = parseInt($networkObject.style.left);
    const y = parseInt($networkObject.style.top);
    $indicator.style.left = `${x}px`;
    $indicator.style.top = `${y}px`;
    
    //Add the indicator to the board
    $board.appendChild($indicator);
}

/**THIS FUNCTION RETURNS THE SVG ELEMENTS THAT FORM THE CONNECTIONS OF A OBJECT WITH A SWITCH*/
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

/**THIS FUNCTION ALLOWS MODALS TO BE DRAGGED*/
function dragModal(event) {

    event.preventDefault();
    const $modal = event.target.closest(".draggable-modal");
    let rect = $modal.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;

    $modal.style.left = `${rect.left}px`;
    $modal.style.top = `${rect.top}px`;
    $modal.style.transform = 'none';
    $modal.style.position = 'fixed';

    function moveModal(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - $modal.offsetWidth;
        let maxY = window.innerHeight - $modal.offsetHeight;
        $modal.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        $modal.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        document.body.style.cursor = "grabbing";
    }

    function stopDraggingModal() {
        document.body.style.cursor = "default";
        document.removeEventListener('mousemove', moveModal);
        document.removeEventListener('mouseup', stopDraggingModal);
        const input = $modal.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveModal);
    document.addEventListener('mouseup', stopDraggingModal);

}

/**THIS FUNCTION ALLOWS OBJECTS TO BE DRAGGED SMOOTHLY ON THE BOARD*/
function startBoardItemMove(event) {

    const $networkObject = event.target.closest(".item-dropped");

    document.addEventListener("mousemove", boardItemMove);
    document.addEventListener("mouseup", boardItemMoveStop);
    
    function boardItemMove(event) {
        const [x, y] = checkObjectClip(event.clientX, event.clientY);
        $networkObject.style.left = `${x}px`;
        $networkObject.style.top = `${y}px`;
        event.stopPropagation();
    }

    function boardItemMoveStop() {
        document.removeEventListener("mousemove", boardItemMove);
        document.removeEventListener("mouseup", boardItemMoveStop);
    }

}

/**THIS FUNCTION SPLITS A TEXT STRING WITH ONLY THE FIRST MATCH USING A SEPARATOR*/
function splitFirst(text, separator) {
    const index = text.indexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**This function splits a string, keeping only the last match.*/
function splitLast(text, separator) {
    const index = text.lastIndexOf(separator);
    if (index === -1) return [text];
    return [text.substring(0, index), text.substring(index + separator.length)];
}

/**This function manages file uploads to the panel.*/
function fileInputChangeHandler(event) {
    let fileName = event.target.files[0].name;
    bodyComponent.render(popupMessage(`Archivo <em>${fileName}</em> cargado con éxito. Para mostrar el contenido, haz click en:`, "/assets/panel/load.svg"));
}

/**This function manages file uploads to the panel.*/
function fileInputLoadHandler() {

    const archivoInput = document.getElementById("fileInput");

    if (archivoInput.files.length === 0) {
        boardComponent.render(popupMessage("Por favor, sube un archivo primero."));
        return;
    }

    const fileName = archivoInput.files[0].name;

    bodyComponent.render(confirmPopup(`¿Deseas cargar el archivo ${fileName}?`, loadState));

}

/**This function manages file downloads to the panel.*/
function downloadState() {
    const $workspace = document.querySelector(".board");
    const workspaceHTML = ($workspace.innerHTML).replace(/\s+/g, " ");
    const blob = new Blob([workspaceHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const $link = document.createElement("a");
    $link.href = url;
    $link.download = "red.ptt";
    document.body.appendChild($link);
    $link.click();
    document.body.removeChild($link);
    URL.revokeObjectURL(url);
}

/**This function manages file uploads to the application.*/
function loadState(files = undefined) {

    const $inputFile = (!files) 
    ? (document.getElementById("fileInput").files[0]) 
    : files[0];

    const reader = new FileReader();

    reader.onload = function (event) {
        const content = event.target.result;
        document.querySelector(".board").innerHTML = content;
        cleanUpWorkspace();
        resetArpTables();
        resetDnsCacheTables();
        setNewIndex();
        setTextContents();
        startLeaseTimers();
    };

    reader.readAsText($inputFile);

    function setNewIndex() {
        
        const itemsDropped = document.querySelectorAll(".item-dropped");
        const itemsText = document.querySelectorAll(".text-annotation");
        let indexes = [];
    
        itemsDropped.forEach(item => {
            let itemid = item.id;
            let itemindex = parseInt(itemid.split("-")[1]);
            if (!isNaN(itemindex)) indexes.push(itemindex);
        });
    
        itemsText.forEach(item => {
            let itemid = item.id;
            let itemindex = parseInt(itemid.split("-")[1]);
            if (!isNaN(itemindex)) indexes.push(itemindex);
        });
    
        itemIndex = (indexes.length > 0) ? Math.max(...indexes) + 1 : 1;
    
    }

    function setTextContents() {

        const itemsText = document.querySelectorAll(".text-annotation");

        for (let i = 0; i < itemsText.length; i++) {
            let text = itemsText[i].getAttribute("data-text");
            let input = itemsText[i].querySelector("input");
            input.value = text;
        }
    }

}

/**This function handles the drag-start of an object in the panel.*/

function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId,
    }));

}

/**THIS FUNCTION MANAGES THE QUICK CONNECT UTILITY ON THE PANEL*/
function quickPingStart() {

    if (quickPingToggle) {
        quickPingEnd();
        return;
    }

    quickPingToggle = true;

 //We create the cursor
    const $cursor = document.createElement("article");
    const $cursorIcon = document.createElement("img");
    $cursor.classList.add("pack-cursor");
    $cursorIcon.src = "./assets/board/pack.svg";
    $cursor.appendChild($cursorIcon);
    document.body.appendChild($cursor);

  //We hide the cursor by default
    document.body.style.cursor = "none";

    //Mouse events
    document.addEventListener("mousemove", moveCursor);

    function moveCursor(event) {
        $cursor.style.top = `${event.clientY}px`;
        $cursor.style.left = `${event.clientX}px`;
    }

    function quickPingEnd() {
        quickPingToggle = false;
        const $cursor = document.querySelectorAll(".pack-cursor");
        $cursor.forEach(cursor => { cursor.removeEventListener("mousemove", moveCursor); });
        $cursor.forEach(cursor => { cursor.remove(); });
        document.body.style.cursor = "default";
    }

}

/**THIS FUNCTION DISPLAYS THE TOOLTIP OF AN OBJECT IN THE PANEL*/
function showTooltip(name, event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) return;
    $panelItem.appendChild(tooltip(name));
}

/**THIS FUNCTION REMOVES THE TOOLTIP FROM AN OBJECT IN THE PANEL*/
function deleteTooltip(event) {
    const $panelItem = event.target.closest(".item");
    if ($panelItem.querySelector(".tooltip")) {
        $panelItem.querySelector(".tooltip").remove();
    }
}

/**THIS FUNCTION RETURNS TRUE IF THE OBJECT IS AN EMPTY OBJECT*/
function isEmptyObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
}

/**THIS FUNCTION GENERATES A DELAY AS A PROMISE*/
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**THIS FUNCTION CLEARS ALL BUFFERS AND TIMERS*/
function cleanUpWorkspace() {

    for (let serverLeaseTime in serverLeaseTimers) {
        clearInterval(serverLeaseTimers[serverLeaseTime]);
        delete serverLeaseTimers[serverLeaseTime];
    }

    for (let clientLeaseTime in clientLeaseTimers) {
        clearInterval(clientLeaseTimers[clientLeaseTime]);
        delete clientLeaseTimers[clientLeaseTime];
    }

    for (let arpEntryTime in arpEntryTimers) {
        clearTimeout(arpEntryTimers[arpEntryTime]);
        delete arpEntryTimers[arpEntryTime];
    }

    for (let dnsCacheTimer in dnsCacheTimers) {
        clearTimeout(dnsCacheTimers[dnsCacheTimer]);
        delete dnsCacheTimers[dnsCacheTimer];
    }

}

/**THIS FUNCTION CLEANSES THE ARP TABLE OF ALL NETWORK OBJECTS*/
function resetArpTables() {
    const $droppedItems = document.querySelectorAll(".item-dropped");
    $droppedItems.forEach(item => {
        const $arpTable = item?.querySelector(".arp-table");
        if ($arpTable) {
            const $rows = $arpTable.querySelectorAll("tr");
            for (let i = 1; i < $rows.length; i++) $rows[i].remove();
        }
    });
}

/**THIS FUNCTION CLEARS THE DNS CACHE TABLE OF ALL NETWORK OBJECTS*/
function resetDnsCacheTables() {
    const $droppedItems = document.querySelectorAll(".item-dropped");
    $droppedItems.forEach(item => {
        const $dnsCacheTable = item?.querySelector(".cache-dns-table");
        if ($dnsCacheTable) {
            const $rows = $dnsCacheTable.querySelectorAll("tr");
            for (let i = 1; i < $rows.length; i++) $rows[i].remove();
        }
    });
}

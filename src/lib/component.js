class componentToken {

    constructor(element) {
        this.element = element;
    }
    
    render(...componentes) {
        const $elements = document.querySelectorAll(this.element);
        $elements.forEach( $element => { 
            componentes.forEach(componente => $element.appendChild(componente));
        });
    }

    event(evento, resultado) {
        const $elements = document.querySelectorAll(this.element);    
        $elements.forEach( $element => $element.addEventListener(evento, resultado));
    }

}

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

    //calculamos la posicion del objeto en funcion de su posicion en el tablero
    
    let objectLeft = (x - objectWidth / 2);
    let objectRight = (x + objectWidth / 2);
    let objectTop = (y - objectHeight / 2);
    let objectBot = (y + objectHeight / 2);

    if (objectLeft < 0) { //el objeto acaba oculto por la izquierda
        let diffLeft = Math.abs(objectLeft);
        newX = x + diffLeft + spareSpace;
    }

    if (objectRight > boardWidth) { //el objeto acaba oculto por la derecha
        let diffRight = Math.abs(objectRight - boardWidth);
        newX = x - diffRight - spareSpace;
    }

    if (objectTop < 0) { //el objeto acaba oculto por arriba
        let diffTop = Math.abs(objectTop);
        newY = y + diffTop + spareSpace;
    }

    if (objectBot > boardHeight) { //el objeto acaba oculto por abajo
        let diffBot = Math.abs(objectBot - boardHeight);
        newY = y - diffBot - spareSpace;
    }

    return [newX, newY];
}

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

function closeObjectModalTable(event, selector) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $Table = $networkObject.querySelector(selector);
    $Table.style.display = "none";
}

function createPacketIndicator(id) {

    const $networkObject = document.getElementById(id)
    const $board = document.querySelector(".board");

    //creamos el indicator
    const $indicator = document.createElement("article");
    const $indicatorIcon = document.createElement("img");
    $indicator.classList.add("pack-cursor");
    $indicatorIcon.src = "./assets/board/pack.svg";
    $indicator.appendChild($indicatorIcon);

    //obtenermos las coordenadas del objeto
    const x = parseInt($networkObject.style.left);
    const y = parseInt($networkObject.style.top);
    $indicator.style.left = `${x}px`;
    $indicator.style.top = `${y}px`;
    
    //agregamos el indicator al tablero
    $board.appendChild($indicator);
}

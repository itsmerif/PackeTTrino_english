function createTextObject(x, y) {
    const $board = document.querySelector(".board");
    const $textObject = document.createElement("article");
    const $input = document.createElement("input");
    const $advancedOptions = document.createElement("div");

    //caracteristicas generales

    $textObject.id = "text-" + itemIndex;
    $textObject.classList.add("text-annotation");
    $textObject.style.left = `${x}px`;
    $textObject.style.top = `${y}px`;
    $textObject.setAttribute("data-text", "");

    //opciones avanzadas

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `<button onclick="deleteItem(event)">Eliminar</button>`;

    //input

    $input.type = "text";

    //eventos

    $textObject.setAttribute("onmousedown", "dragText(event)");
    $input.setAttribute("oninput", "autoExtendText.call(this)");
    $textObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");

    //construimos el objeto

    $textObject.appendChild($advancedOptions);
    $textObject.appendChild($input);
    $board.appendChild($textObject);
    itemIndex++;
}

function autoExtendText() {
    const container = this.parentElement;
    const input = container.querySelector("input");
    const content = input.value;
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.whiteSpace = 'pre';
    temp.style.font = window.getComputedStyle(input).font;
    temp.textContent = this.value || 'W';  
    document.body.appendChild(temp);
    const width = temp.getBoundingClientRect().width;
    document.body.removeChild(temp); 
    const newWidth = Math.max(40, width + 20);
    container.style.width = `${newWidth}px`;
    container.style.marginLeft = `-${newWidth/2}px`;
    container.setAttribute("data-text", content);
}

function dragText(event) {
    event.preventDefault();
    const text = event.target.closest(".text-annotation");
    let rect = text.getBoundingClientRect();
    let offsetX = event.clientX - rect.left - rect.width / 2;
    let offsetY = event.clientY - rect.top - rect.height / 2;
    text.style.position = 'absolute';

    function moveText(moveEvent) {
        document.body.style.cursor = "none";
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - text.offsetWidth;
        let maxY = window.innerHeight - text.offsetHeight;
        text.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        text.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', moveText);
        document.removeEventListener('mouseup', stopDragging);
        const input = text.querySelector('input');
        if (input) input.focus();
        document.body.style.cursor = "default";
    }

    document.addEventListener('mousemove', moveText);
    document.addEventListener('mouseup', stopDragging);
}

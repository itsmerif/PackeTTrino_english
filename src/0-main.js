//variables globales

let itemIndex = 0;
let quickInfoTimeout;
const leaseTimers = {};

// funciones de inicio

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
    setTimeout(hideLoadingScreen, 200);
    getPanelItems();
    await sleep(500);
    document.querySelector(".terminal-component").addEventListener("keydown", terminalKeyboard); //añadimos eventos de teclado al terminal
    document.getElementById("item-panel").querySelector(".ping").addEventListener("click", showPingForm); //añadimos eventos de clic al item ping del panel
    document.getElementById("item-panel").querySelector(".dynrouting").addEventListener("click", showDynamicRoutingModal); //añadimos eventos de doble clic al item ping del panel
    document.querySelector(".pc-form").querySelector("input[type='checkbox']").addEventListener("change", disableOptionsPcForm); //deshabilitar opciones si esta en modo dhcp
    document.getElementById("item-panel").querySelector(".traffic").addEventListener("click", showPacketTraffic); //añadimos eventos de clic al item de la tabla de tráfico
    document.addEventListener("keydown", closeEveryThing);
    document.querySelector(".filter-traffic").querySelector("input").addEventListener("keydown", (event) => { if (event.key === "Enter") { filterPacketTraffic(); } });
    removePropagationPingform();
}

function getPanelItems() {
    fetch("./src/components/panel-items.json")
        .then(response => response.json())
        .then(data => {
            const panel = document.getElementById("item-panel");
            data.forEach(item => {
                const itemElement = document.createElement("article");
                itemElement.classList.add("item", item.name);
                itemElement.draggable = item.draggable;
                itemElement.ondragstart = dragStart;
                itemElement.innerHTML = `<img src="${item.image}" alt="${item.name}" draggable="${item.draggable}" style="width: ${item.size}; height: ${item.size};" />`;
                panel.appendChild(itemElement);
            });
        });
}

function showPingForm() {
    const form = document.querySelector(".ping-form");
    if (form.style.display === "none") {
        form.style.display = "flex";
        form.ip1.focus();
    } else {
        form.style.display = "none";
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll(".advanced-options-modal");
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
}

function removePropagationPingform() {
    const form = document.querySelector(".ping-form");
    const inputs = form.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("mousedown", event => {
            event.stopPropagation()
        });
    }
}

function downloadState() {
    const elemento = document.querySelector(".board");
    const contenidoHTML = elemento.innerHTML;
    const blob = new Blob([contenidoHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "contenido.html"; // Nombre del archivo
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url); // Liberar el objeto URL
}

function loadState() {
    const archivoInput = document.getElementById("fileInput");
    if (archivoInput.files.length === 0) {
        alert("Por favor, selecciona un archivo.");
        return;
    }
    const archivo = archivoInput.files[0];
    const lector = new FileReader();
    lector.onload = function (event) {
        const contenido = event.target.result;
        document.querySelector(".board").innerHTML = contenido;
        setNewIndex();
        setTextContents();
        startLeaseTimers();
    };
    lector.readAsText(archivo);
}

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

    itemIndex = indexes.length > 0 ? Math.max(...indexes) + 1 : 1;

}

function setTextContents() {

    const itemsText = document.querySelectorAll(".text-annotation");

    for (let i = 0; i < itemsText.length; i++) {
        let text = itemsText[i].getAttribute("data-text");
        let input = itemsText[i].querySelector("input");
        input.value = text;
    }
}

function showTerminal(event) {

    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");

    //mostramos el terminal usando el id del elemento
    const terminal = document.querySelector(".terminal-component");
    terminal.setAttribute("data-id", networkObject.id);
    terminal.style.display = "block";

    //ocultamos las opciones avanzadas
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
}

function dragPingForm(event) {

    event.preventDefault();
    document.body.style.cursor = "move";
    const pingform = event.target.closest(".ping-form");
    let rect = pingform.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;
    pingform.style.right = 'auto';
    pingform.style.left = `${rect.left}px`;
    pingform.style.top = `${rect.top}px`;

    function movePingForm(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - pingform.offsetWidth;
        let maxY = window.innerHeight - pingform.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        pingform.style.left = `${x}px`;
        pingform.style.top = `${y}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', movePingForm);
        document.removeEventListener('mouseup', stopDragging);
        document.body.style.cursor = "default";
    }

    document.addEventListener('mousemove', movePingForm);
    document.addEventListener('mouseup', stopDragging);
}

function closeEveryThing(event) {
    if (event.key === "Escape") {
        //cerramos todos los formularios
        let forms = document.querySelectorAll("form");
        for (let i = 0; i < forms.length; i++) {
            forms[i].style.display = "none";
        }
        closeBrowser(event);
        document.querySelector(".packet-traffic").style.display = "none";
        closeTerminal(event);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}
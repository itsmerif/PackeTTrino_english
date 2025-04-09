var root = { render: (component) => document.getElementById("root").appendChild(component()) };
var body = { render: (component) => document.body.appendChild(component()) };

root.render(itemBoard);
root.render(itemPanel);
body.render(pc_menu);
body.render(dns_server_menu);
body.render(dhcp_server_menu);
body.render(dhcp_agent_menu);
body.render(router_menu);
body.render(terminal);
body.render(browser);
body.render(packetTracer);
document.addEventListener("keydown", documentKeyboardHandler);
setTimeout(hideLoadingScreen, 1000);


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";
    const x = event.clientX;
    const y = event.clientY;
    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId,
        originx: x,
        originy: y
    }));
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
    enlace.download = "contenido.html";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
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

function showTerminal(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const terminal = document.querySelector(".terminal-component");
    terminal.setAttribute("data-id", networkObject.id);
    terminal.style.display = "block";
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
}

function documentKeyboardHandler(event) {

    const keyboardActions = {
        "Escape": () => closeEveryThing(event)
    }

    keyboardActions[event.key] ? keyboardActions[event.key]() : null;
}

function closeEveryThing(event) {
    document.querySelectorAll(".modal").forEach(modal => { modal.style.display = "none"; });
    closeBrowser(event);
    closeTraffic();
    closeTerminal(event);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

function icmpTryoutStart() {

    if (icmpTryoutToggle) {
        icmpTryoutEnd();
        return;
    }

    icmpTryoutToggle = true;

    //creamos el cursor
    const $cursor = document.createElement("article");
    const $cursorIcon = document.createElement("img");
    $cursor.classList.add("pack-cursor");
    $cursorIcon.src = "./assets/board/pack.svg";
    $cursor.appendChild($cursorIcon);
    document.body.appendChild($cursor);

    //ocultamos el cursor por defecto
    document.body.style.cursor = "none";

    //eventos del mouse
    document.addEventListener("mousemove", moveCursor);

    function moveCursor(event) {
        $cursor.style.top = `${event.clientY}px`;
        $cursor.style.left = `${event.clientX}px`;
    }

    function icmpTryoutEnd() {
        icmpTryoutToggle = false;
        const $cursor = document.querySelectorAll(".pack-cursor");
        $cursor.forEach(cursor => { cursor.removeEventListener("mousemove", moveCursor); });
        $cursor.forEach(cursor => { cursor.remove(); });
        document.body.style.cursor = "default";
    }

}

function closeTraffic() {
    const $traffic = document.querySelector(".packet-traffic");
    $traffic.style.display = "none";
}
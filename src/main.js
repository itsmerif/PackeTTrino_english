//variables globales

let itemIndex = 0;

// funciones de inicio

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
    getPanelItems();
    await sleep(500);
    document.querySelector(".pc-terminal").addEventListener("keydown", terminalKeyboard);
    document.getElementById("item-panel").querySelector(".ping").addEventListener("click", showPingForm);
    removePropagationPingform()
}

function getPanelItems() {
    fetch("./components/panel-items.json")
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

function terminalKeyboard(event) {
    if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        document.querySelector(".terminal-output").innerHTML = "";
    }

    if (event.key === "Escape") {
        event.preventDefault();
        document.querySelector(".pc-terminal").style.display = "none";
        document.querySelector(".terminal-output").innerHTML = "";
        document.querySelector(".pc-terminal").querySelector("input").value = "";
    }
}

function deleteMouse() {
    let cursor = document.body.style.cursor;
    if (cursor.includes("cTargetX")) {
        document.body.style.cursor = "default";
    } else {
        document.body.style.cursor = "url('/assets/cTargetX.png'), auto";
    }
}

async function pingSim() {
    const form = document.querySelector(".ping-form");
    const ip1 = form.ip1.value;
    const ip2 = form.ip2.value;
    try {
        await ping(ip1, ip2, true);
        await ping(ip2, ip1, true);
    } catch (error) {
        console.error("Error durante el ping:", error);
    }
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
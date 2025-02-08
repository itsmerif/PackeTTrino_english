//variables globales

let itemIndex = 0;

// funciones de inicio

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
    getPanelItems();
    await sleep(500);
    document.querySelector(".pc-terminal").addEventListener("keydown", stopPing);
    document.getElementById("item-panel").querySelector(".ping").addEventListener("click", showPingForm);
    document.getElementById("board").addEventListener("dragover", dragOverBoard);
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

function stopPing(event) {
    if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        document.querySelector(".terminal-output").innerHTML = "";
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

function pingSim() {
    const form = document.querySelector(".ping-form");
    const ip1 = form.ip1.value;
    const ip2 = form.ip2.value;
    ping(ip1, ip2, true);
}

function showPingForm(event) {
    const form = document.querySelector(".ping-form");
    if ( form.style.display === "none") {
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
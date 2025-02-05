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
    document.querySelector(".item.delete").addEventListener("click", deleteMouse);
}


function getPanelItems() {
    fetch("./components/panel-items.json")
        .then(response => response.json())
        .then(data => {
            const panel = document.getElementById("item-panel");
            data.forEach(item => {
                const itemElement = document.createElement("article");
                itemElement.classList.add("item", item.name);
                itemElement.draggable = true;
                itemElement.ondragstart = dragStart;
                itemElement.innerHTML = `<img src="${item.image}" alt="${item.name}" />`;
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

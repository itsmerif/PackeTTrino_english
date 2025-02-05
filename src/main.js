//variables globales

let itemIndex = 0;

// funciones de inicio

function init() {
    getPanelItems();

    //eventos
    document.querySelector(".pc-terminal").addEventListener("keydown", stopPing);
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
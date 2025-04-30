/**ESTA FUNCION OCULTA TODOS LOS MODALES DE OPCIONES AVANZADAS */
function closeAllAdvOptsModals() {
    const modals = document.querySelectorAll(".advanced-options-modal");
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
}

/**ESTA FUNCION GESTIONA LOS EVENTOS DE TECLADO EN EL DOCUMENTO */
function documentKeyboardHandler(event) {

    const keyboardActions = {
        "Escape": () => closeEveryThing(event)
    }

    keyboardActions[event.key] ? keyboardActions[event.key]() : null;
}

/**ESTA FUNCION OCULTA TODOS LOS MODALES */
function closeEveryThing(event) {
    document.querySelectorAll(".modal").forEach(modal => { modal.style.display = "none"; });
    closeBrowser(event);
    closeTraffic();
    closeTerminal(event);
}

/**ESTA FUNCION GESTIONA EL MODO OSCURO DE LA APLICACION */
function activateDarkMode() {

    const $checkbox = document.querySelector(".settings-modal").querySelector("#dark-mode");

    if ($checkbox.checked) {
        darkMode = true;
        document.querySelector(".board").classList.add("dark-mode");
        document.querySelector("#item-panel").classList.add("dark-mode");
        document.querySelectorAll(".modal").forEach(modal => modal.classList.add("modal-dark-mode"));
        document.querySelector("#svg-board").querySelectorAll("line").forEach(line => line.setAttribute("stroke", "white"));
        document.querySelector(".board").querySelectorAll(".modal-table").forEach(modal => modal.classList.add("dark-mode"));
        document.querySelector(".packet-traffic").classList.add("dark-mode");
        changePanelIcons("dark");
        return;
    }

    darkMode = false;
    document.querySelector(".board").classList.remove("dark-mode");
    document.querySelector("#item-panel").classList.remove("dark-mode");
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("modal-dark-mode"));
    document.querySelector("#svg-board").querySelectorAll("line").forEach(line => line.setAttribute("stroke", "black"));
    document.querySelector(".board").querySelectorAll(".modal-table").forEach(modal => modal.classList.remove("dark-mode"));
    document.querySelector(".packet-traffic").classList.remove("dark-mode");
    changePanelIcons("light");

    function changePanelIcons(theme) {

        const $panel = document.querySelector("#item-panel");

        const $items = $panel.querySelectorAll(".item");
    
        if (theme === "dark") {
            $items.forEach(item => {
                const fullname = (item.querySelector("img").src).split("/")[(item.querySelector("img").src).split("/").length - 1];
                item.querySelector("img").src = `./assets/panel/dark/${fullname}`;
            });
        }
    
        if (theme === "light") {
            $items.forEach(item => {
                const fullname = (item.querySelector("img").src).split("/")[(item.querySelector("img").src).split("/").length - 1];
                item.querySelector("img").src = `./assets/panel/${fullname}`;
            });
        }
        
    }
    
}


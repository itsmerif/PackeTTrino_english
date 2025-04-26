/**ESTA FUNCIONA INICIA LA APLICACION */
function startApp() {

    const loadingScreen = document.getElementById('loading-screen');

    loadingScreen.style.opacity = '0';

    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector(".settings-modal").querySelector("#dark-mode").checked = true;
        activateDarkMode();
    }
    
    document.querySelector("#item-panel").classList.remove("hidden");

    const $items = document.querySelector("#item-panel").querySelectorAll(".item");
    let time = 0;

    $items.forEach((item) => {
        setTimeout( () => {
            item.classList.remove("hidden");
        }, time);
        time += 30;
    });

}

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
        return;
    }

    darkMode = false;
    document.querySelector(".board").classList.remove("dark-mode");
    document.querySelector("#item-panel").classList.remove("dark-mode");
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("modal-dark-mode"));
    document.querySelector("#svg-board").querySelectorAll("line").forEach(line => line.setAttribute("stroke", "black"));
    document.querySelector(".board").querySelectorAll(".modal-table").forEach(modal => modal.classList.remove("dark-mode"));
}
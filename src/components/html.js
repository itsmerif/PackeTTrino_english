function closeAllModals() {
    const modals = document.querySelectorAll(".advanced-options-modal");
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
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

function closeTraffic() {
    const $traffic = document.querySelector(".packet-traffic");
    $traffic.style.display = "none";
}

function startApp() {

    const loadingScreen = document.getElementById('loading-screen');

    loadingScreen.style.opacity = '0';

    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);

    document.querySelector("#item-panel").classList.remove("hidden");

    const $items = document.querySelector("#item-panel").querySelectorAll(".item");
    let time = 0;

    document.querySelector("#item-panel").querySelectorAll(".item").forEach((item) => {
        setTimeout( () => {
            item.classList.remove("hidden");
        }, time);
        time += 30;
    });

}
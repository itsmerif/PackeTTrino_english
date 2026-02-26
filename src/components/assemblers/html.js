/**This function hides all advanced options*/
function closeAllAdvOptsModals() {
    const modals = document.querySelectorAll(".advanced-options-modal");
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
}

/**This function manages keyboard events in the document*/
function documentKeyboardHandler(event) {

    const keyboardActions = {
        "Escape": () => closeEveryThing(event)
    }

    keyboardActions[event.key] ? keyboardActions[event.key]() : null;
}

/**This function hides all modals*/
function closeEveryThing(event) {

    //We close all modals
    document.querySelectorAll(".modal").forEach($modal => {
        if (window.getComputedStyle($modal).display === "none") return; //Patch; it's better to use classes
        const $closeBtn = $modal.querySelector("#close-btn");
        if ($closeBtn) $closeBtn.click();
    });

    //Close all pop-up messages
    document.querySelectorAll(".popup-content").forEach($popup => {
        const $closeBtn = $popup.querySelector("#btn-close");
        const $cancelBtn = $popup.querySelector("#btn-cancel");
        if ($closeBtn) $closeBtn.click();
        if ($cancelBtn) $cancelBtn.click();
    });

    //Close the tools
    closeBrowser(event); 
    closeTraffic();
    closeTerminal(event);
}

/**This function manages the application's dark mode*/
function activateDarkMode() {

    const $checkbox = document.querySelector(".settings-modal").querySelector("#dark-mode");
    const $board = document.querySelector(".board");
    const $panel = document.querySelector("#item-panel");
    const $modals = document.querySelectorAll(".modal");
    const $innerTables = document.querySelectorAll(".inner-table");
    const $svgBoard = document.querySelector("#svg-board");
    const $packetTraffic = document.querySelector(".packet-traffic");

    if ($checkbox.checked) {

        darkMode = true;
        localStorage.setItem("dark-mode", "true");
        $board.classList.add("dark-mode");
        $panel.classList.add("dark-mode");
        $modals.forEach(modal => modal.classList.add("modal-dark-mode"));
        $svgBoard.querySelectorAll("line").forEach(line => line.setAttribute("stroke", "white"));
        $board.querySelectorAll(".modal-table").forEach(modal => modal.classList.add("dark-mode"));
        $packetTraffic.classList.add("dark-mode");
        $innerTables.forEach(table => table.classList.add("dark-mode"));
        changePanelIcons("dark");

    }else {

        darkMode = false;
        localStorage.setItem("dark-mode", "false");
        $board.classList.remove("dark-mode");
        $panel.classList.remove("dark-mode");
        $modals.forEach(modal => modal.classList.remove("modal-dark-mode"));
        $svgBoard.querySelectorAll("line").forEach(line => line.setAttribute("stroke", "black"));
        $board.querySelectorAll(".modal-table").forEach(modal => modal.classList.remove("dark-mode"));
        $packetTraffic.classList.remove("dark-mode");
        $innerTables.forEach(table => table.classList.remove("dark-mode"));
        changePanelIcons("light");
        
    }

    function changePanelIcons(theme) {

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


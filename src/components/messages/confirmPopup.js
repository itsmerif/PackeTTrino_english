function confirmPopup(message, callback)  {

    if (document.querySelectorAll(".popup-content").length > 0) return;

    const $popup = document.createElement("div");

    $popup.classList.add("popup-content", "confirm");

    if (darkMode) $popup.classList.add("dark-mode");

    $popup.innerHTML = `
        <p>${message}</p>
        <button class="btn-modern-blue dark no-animation" id="btn-accept" style="padding: 5px;" >Accept</button>
        <button class="btn-modern-red no-animation" id="btn-cancel" style="padding: 5px;">Cancel</button>
    `;

    $popup.querySelector("#btn-accept").addEventListener("click", (event) => {
        closePopup(event);
        callback();
    });

    $popup.querySelector("#btn-cancel").addEventListener("click", closePopup);

    function closePopup(event) {

        const $popup = event.target.closest(".popup-content");

        $popup.querySelector("#btn-accept").removeEventListener("click", (event) => {
            closePopup(event);
            callback();
        });

        $popup.querySelector("#btn-cancel").removeEventListener("click", closePopup);

        $popup.remove();

    }

    return $popup;

}

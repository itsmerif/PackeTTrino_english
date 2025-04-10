function popupMessage(message) {

    let $popup = document.createElement("div");

    $popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button class="btn-blue" onclick="closePopup()">Ok</button>
        </div>
    `;

    $popup.querySelector(".btn-blue").addEventListener("click", closePopup);

    return $popup;
}

function closePopup() {
    document.querySelector(".modal-overlay").style.display = "none";
    $popupComponent.removeEventListener("click", closePopup);
    $popupComponent.remove();
}
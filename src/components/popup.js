function popupMessage(message) {

    closeAllModals();

    let $popup = document.createElement("div");

    $popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button class="btn-blue">Ok</button>
        </div>
    `;

    $popup.querySelector(".btn-blue").addEventListener("click", closePopup);

    return $popup;
    
}

function closePopup(event) {
    const $popupComponent = event.target.closest(".popup-content");
    $popupComponent.removeEventListener("click", closePopup);
    $popupComponent.remove();
}
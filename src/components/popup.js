function popupMessage(message) {

    closeAllModals();

    let $popup = document.createElement("div");
    
    $popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button class="btn-modern-red" style="padding: 5px;" > Cerrar </button>
        </div>
    `;

    $popup.querySelector("button").addEventListener("click", closePopup);

    return $popup;
    
}

function closePopup(event) {
    const $popupComponent = event.target.closest(".popup-content");
    $popupComponent.removeEventListener("click", closePopup);
    $popupComponent.remove();
}
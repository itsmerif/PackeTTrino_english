function popupMessage(message, imgsrc = "") {

    closeAllModals();

    let $popup = document.createElement("div");
    let imgFragment = (imgsrc !== "") ? `<img src="${imgsrc}" alt="icon">` : "";
    $popup.innerHTML = `
        <div class="popup-content">
            <div>
                <p>${message}</p>
                ${imgFragment}
            </div>     
            <button class="btn-modern-red no-animation" style="padding: 5px;" > Cerrar </button>
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
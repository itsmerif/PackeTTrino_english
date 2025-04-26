function popupMessage(message, imgsrc = "") {

    if (document.querySelectorAll(".popup-content").length > 0) return;

    closeAllAdvOptsModals();

    let $popup = document.createElement("div");
    
    $popup.classList.add("popup-content", "message");
    
    let imgFragment = (imgsrc !== "") ? `<img src="${imgsrc}" alt="icon">` : "";

    $popup.innerHTML = `
        <div>
            <p>${message}</p>
            ${imgFragment}
        </div>     
        <button class="btn-modern-red no-animation" style="padding: 5px;" > Cerrar </button>
    `;

    $popup.querySelector("button").addEventListener("click", closePopup);

    function closePopup(event) {
        const $popupComponent = event.target.closest(".popup-content");
        $popupComponent.querySelector("button").removeEventListener("click", closePopup);
        $popupComponent.remove();
    }
    
    return $popup;
    
}
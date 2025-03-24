function popupMessage(message) {

    let $popupComponent = document.createElement("div");
    $popupComponent.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="popup-content">
            <p>${message}</p>
            <button class="btn-blue" onclick="closePopup()">Ok</button>
        </div>
    `;

    $popupComponent.querySelector(".btn-blue").addEventListener("click", closePopup);

    function closePopup() {
        $popupComponent.remove();
    }

    document.body.appendChild($popupComponent);
}
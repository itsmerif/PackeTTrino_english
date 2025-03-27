function popupMessage(message) {

    let $popupComponent = document.createElement("div");
    $popupComponent.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button class="btn-blue" onclick="closePopup()">Ok</button>
        </div>
    `;

    $popupComponent.querySelector(".btn-blue").addEventListener("click", closePopup);

    function closePopup() {
        document.querySelector(".modal-overlay").style.display = "none";
        $popupComponent.remove();
    }

    document.querySelector(".modal-overlay").style.display = "block";
    document.body.appendChild($popupComponent);
}
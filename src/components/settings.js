function showOptions() {

    if (document.querySelector(".settings-modal-container")) {
        document.querySelector(".settings-modal-container").remove();
        return;
    }

    const modalComponent = document.createElement("div");
    const $btnStyle = "btn-modern-blue";
    const $inputStyle = "btn-toggle";
    modalComponent.classList.add("settings-modal-container");
    modalComponent.innerHTML = `

    <form class="settings-modal">

        <h1> Opciones Avanzadas </h1>

        <div class="options-group">
            <label for="visual-toggle"> Modo Visual</label>
            <input type="checkbox" class=${$inputStyle} id="visual-toggle" name="visual-toggle">
        </div>

        <div class="options-group">
            <label for="ignore-arp-traffic"> Tráfico ARP (Visual) </label>
            <input type="checkbox" class=${$inputStyle} id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>

        <div class="options-group">
            <label for="legacy-icons"> Iconos Legado </label>
            <input type="checkbox" class=${$inputStyle} id="legacy-icons" name="legacy-icons">
        </div>

        <div class="options-group">
            <label for="dark-mode"> Modo Oscuro </label>
            <input type="checkbox" class=${$inputStyle} id="dark-mode" name="dark-mode">
        </div>

        <div class="options-group">
            <label for="template-option"> Template Option (Visual) </label>
            <input type="checkbox" class=${$inputStyle} id="template-option" name="template-option">
        </div>
        
        <button class=${$btnStyle}>Aplicar</button>

    </form>`;

    if (ignoreArpTraffic) {
        modalComponent.querySelector("#ignore-arp-traffic").checked = true;
    }

    if (visualToggle) {
        modalComponent.querySelector("#visual-toggle").checked = true;
    }

    modalComponent.querySelector("#ignore-arp-traffic").addEventListener("change", function () {ignoreArpTraffic = this.checked;});
    modalComponent.querySelector("#visual-toggle").addEventListener("change", function () {visualToggle = this.checked;});
    modalComponent.querySelector(`.${$btnStyle}`).addEventListener("click", closeSettingsModal);
    document.body.appendChild(modalComponent);

}

function closeSettingsModal() {
    const modalComponent = document.querySelector(".settings-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    modalComponent.remove();
}
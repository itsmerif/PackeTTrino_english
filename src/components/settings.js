function showOptions() {

    const modalComponent = document.createElement("div");
    const $btnStyle = "btn-green";
    modalComponent.classList.add("settings-modal-container");
    modalComponent.innerHTML = `
    <form class="settings-modal">
        <div class="form-group">
            <label for="visual-toggle"> Visualización (Visual) </label>
            <input type="checkbox" id="visual-toggle" name="visual-toggle">
        </div>
        <div class="form-group">
            <label for="ignore-arp-traffic"> Ignorar tráfico ARP (Visual) </label>
            <input type="checkbox" id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>
        <button class=${$btnStyle}>Aceptar</button>
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
    document.querySelector(".modal-overlay").style.display = "block";
    document.body.appendChild(modalComponent);

}

function closeSettingsModal() {
    const modalComponent = document.querySelector(".settings-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    modalComponent.remove();
}
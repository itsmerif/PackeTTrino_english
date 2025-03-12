function showOptions() {

    const modalComponent = document.createElement("div");
    modalComponent.classList.add("settings-modal-container");
    modalComponent.innerHTML = `
    <div class="modal-overlay"></div>
    <form class="settings-modal">
        <div class="form-group">
            <label for="ignore-arp-traffic"> Ignorar tráfico ARP (Visual) </label>
            <input type="checkbox" id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>
        <button class="btn-blue">Aceptar</button>
    </form>`;

    if (ignoreArpTraffic) {
        modalComponent.querySelector("#ignore-arp-traffic").checked = true;
    }

    modalComponent.querySelector("#ignore-arp-traffic").addEventListener("change", function () {ignoreArpTraffic = this.checked;});
    modalComponent.querySelector(".btn-blue").addEventListener("click", closeSettingsModal);
    document.body.appendChild(modalComponent);

}

function closeSettingsModal() {
    const modalComponent = document.querySelector(".settings-modal-container");
    modalComponent.remove();
}
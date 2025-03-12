function showOptions() {

    const modalComponent = document.createElement("div");
    modalComponent.classList.add("settings-modal-container");
    modalComponent.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="settings-modal">
        <p>Opciones</p>
        <button class="btn-close" onclick="closeSettingsModal()">Cerrar</button>
    </div>`;

    document.body.appendChild(modalComponent);

}
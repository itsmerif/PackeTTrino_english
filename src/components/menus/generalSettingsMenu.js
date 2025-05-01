function GeneralOptions() {

    const $generalOptions = document.createElement("form");
    const btnStyle = "btn-modern-blue";
    const inputStyle = "btn-toggle";

    $generalOptions.classList.add("settings-modal", "modal");

    $generalOptions.innerHTML = `

        <h1> Opciones Avanzadas </h1>

        <div class="options-group">
            <label for="visual-toggle"> Modo Visual</label>
            <input type="checkbox" class=${inputStyle} id="visual-toggle" name="visual-toggle">
        </div>

        <div class="options-group">
            <label for="ignore-arp-traffic"> No mostrar paquetes ARP </label>
            <input type="checkbox" class=${inputStyle} id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>

        <div class="options-group">
            <label for="dark-mode"> Modo Oscuro </label>
            <input type="checkbox" class=${inputStyle} id="dark-mode" name="dark-mode">
        </div>
        
        <button class=${btnStyle}>Cerrar</button>
    `;

    $generalOptions.querySelector("#ignore-arp-traffic").addEventListener("change", function () { ignoreArpTraffic = this.checked; });
    $generalOptions.querySelector("#visual-toggle").addEventListener("change", function () { visualToggle = this.checked; });
    $generalOptions.querySelector("#dark-mode").addEventListener("change", activateDarkMode);
    $generalOptions.querySelector(`.${btnStyle}`).addEventListener("click", generalOptionsHandler);

    return $generalOptions;

}

function generalOptionsHandler(event) {
    event.preventDefault();
    const $generalOptions = document.querySelector(".settings-modal");
    const isVisible = $generalOptions.style.display === "flex";
    $generalOptions.querySelector("#visual-toggle").checked = visualToggle;
    $generalOptions.querySelector("#ignore-arp-traffic").checked = ignoreArpTraffic;
    $generalOptions.querySelector("#dark-mode").checked = darkMode;
    (isVisible) ? $generalOptions.style.display = "none" : $generalOptions.style.display = "flex";
}
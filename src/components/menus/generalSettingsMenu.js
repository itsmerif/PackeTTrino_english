function GeneralOptions() {

    const $generalOptions = document.createElement("form");

    $generalOptions.classList.add("settings-modal", "modal", "draggable-modal");

    $generalOptions.innerHTML = `

        <div class="window-frame"> <p> Opciones Generales </p> </div>

        <div class="options-group">
            <label for="visual-toggle"> Modo Visual</label>
            <input type="checkbox" class="btn-toggle" id="visual-toggle" name="visual-toggle">
        </div>

        <div class="options-group">
            <label for="ignore-arp-traffic"> No Mostrar Tráfico ARP </label>
            <input type="checkbox" class="btn-toggle" id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>

        <div class="options-group">
            <label for="dark-mode"> Modo Oscuro </label>
            <input type="checkbox" class="btn-toggle" id="dark-mode" name="dark-mode">
        </div>
        
        <div class="options-group">
            <label for="visual-speed"> Velocidad de Animación </label>
            <input type="range" id="visual-speed" name="visual-speed" min="100" max="1000">
            <p id="visual-speed-value">300</p><span>ms</span>
        </div>

        <button class="btn-modern-blue">Cerrar</button>
    `;

    $generalOptions.querySelector("#ignore-arp-traffic").addEventListener("change", function () { ignoreArpTraffic = this.checked; });
    $generalOptions.querySelector("#visual-toggle").addEventListener("change", function () { visualToggle = this.checked; });
    $generalOptions.querySelector("#dark-mode").addEventListener("change", activateDarkMode);
    $generalOptions.querySelector(".btn-modern-blue").addEventListener("click", generalOptionsHandler);
    $generalOptions.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $generalOptions.querySelector("#visual-speed").addEventListener("input", function () { 
        visualSpeed = this.value; 
        $generalOptions.querySelector("#visual-speed-value").innerHTML = this.value;
    });

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
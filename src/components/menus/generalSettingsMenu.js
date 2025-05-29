function GeneralOptions() {

    const $generalOptions = document.createElement("form");

    $generalOptions.classList.add("settings-modal", "modal", "draggable-modal");

    $generalOptions.innerHTML = `

        <div class="window-frame"> <p> Opciones Generales </p> </div>

        <div class="options-group">
            <label for="dark-mode"> Modo Oscuro </label>
            <input type="checkbox" class="btn-toggle" id="dark-mode" name="dark-mode">
        </div>

        <div class="options-group">
            <label for="visual-toggle"> Modo Visual </label>
            <input type="checkbox" class="btn-toggle" id="visual-toggle" name="visual-toggle">
        </div>

        <div class="options-group">
            <label for="ignore-arp-traffic"> Ocultar Tráfico ARP </label>
            <input type="checkbox" class="btn-toggle" id="ignore-arp-traffic" name="ignore-arp-traffic">
        </div>

        <div class="options-group">
            <label for="arp-ttl"> ARP TTL </label>
            <input type="range" class="btn-input" id="arp-ttl" name="arp-ttl" min="120" max="600" value="400">
            <span id="arp-ttl-value">400</span><span>s</span>
        </div>

        <div class="options-group">
            <label for="mac-ttl"> MAC TTL </label>
            <input type="range" class="btn-input" id="mac-ttl" name="mac-ttl" min="0" max="300" value="300">
            <span id="mac-ttl-value">300</span><span>s</span>
        </div>
      
        <button class="btn-modern-blue" id="close-btn">Cerrar</button>
    `;

    $generalOptions.querySelector("#ignore-arp-traffic").addEventListener("change", function () { ignoreArpTraffic = this.checked; });
    $generalOptions.querySelector("#visual-toggle").addEventListener("change", function () { visualToggle = this.checked; });
    $generalOptions.querySelector("#dark-mode").addEventListener("change", activateDarkMode);
    $generalOptions.querySelector(".btn-modern-blue").addEventListener("click", generalOptionsHandler);
    $generalOptions.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    
    $generalOptions.querySelector("#arp-ttl").addEventListener("input", function () { 
        $MACENTRYTTL = this.value;
        $generalOptions.querySelector("#arp-ttl-value").innerHTML = this.value;
    });
    
    $generalOptions.querySelector("#mac-ttl").addEventListener("input", function () { 
        $ARPENTRYTTL = this.value;
        $generalOptions.querySelector("#mac-ttl-value").innerHTML = this.value
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
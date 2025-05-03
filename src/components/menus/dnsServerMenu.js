function dns_server_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("dns-form", "modal", "draggable-modal");

    $menu.innerHTML = `

        <div class="window-frame"> <p id="form-dns-item-id"> </p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="ip">Dirección IP (IPv4):</label>
                <input type="text" id="ip-dns" name="ip-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div class="form-item">
                <label for="netmask">Máscara de Red:</label>
                <input type="text" id="netmask-dns" name="netmask-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div class="form-item">
                <label for="gateway">Puerta de Enlace:</label>
                <input type="text" id="gateway-dns" name="gateway-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

        </section>

        <section class="dns-server-section">

            <div class="form-item">
                <label for="dns-recursive">Servidor DNS Recursivo:</label>
                <input class="btn-toggle" type="checkbox" id="dns-recursive" name="dns-recursive">
            </div>

            <div class="form-item">
                <label for="dns-cache">Servidor DNS Caché:</label>
                <input class="btn-toggle" type="checkbox" id="dns-cache" name="dns-cache">
            </div>

            <div class="form-item">
                <label for="dns-secondary">Servidor DNS Secundario:</label>
                <input class="btn-toggle" type="checkbox" id="dns-secondary" name="dns-secondary">
            </div>

        </section>

        <section class="button-wrapper">
            <button class="btn-modern-blue dark" type="submit">Guardar</button>
            <button class="btn-modern-red dark" id="btn-close">Cerrar</button>
        </section>

    `;

    $menu.addEventListener("submit", saveDnsServerMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#btn-close").addEventListener("click", closeDnsMenu);
    
    return $menu;

}

function showDnsServerMenu(event) {

    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    const $serverObject = event.target.closest(".item-dropped");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess($serverObject.id);
        return;
    }

    const $menu = document.querySelector(".dns-form");
    const isRecursive = $serverObject.getAttribute("recursion");
    $menu.querySelector("#ip-dns").value = $serverObject.getAttribute("ip-enp0s3");
    $menu.querySelector("#netmask-dns").value = $serverObject.getAttribute("netmask-enp0s3");
    $menu.querySelector("#gateway-dns").value = $serverObject.getAttribute("data-gateway");
    $menu.querySelector("#dns-recursive").checked = isRecursive === "true";
    if (!$serverObject.id.startsWith("dns-server-")) $menu.querySelector(".basic-section").classList.add("hidden");
    document.getElementById("form-dns-item-id").innerHTML = $serverObject.id;
    $menu.style.display = "flex";
}

function saveDnsServerMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = document.querySelector(".dns-form");
    const $serverObject = document.getElementById($menu.querySelector("#form-dns-item-id").innerHTML);
    const isRecursive = $menu.querySelector("#dns-recursive").checked;

    if ($serverObject.id.startsWith("dns-server")) {
        const ip = $menu.querySelector("#ip-dns").value;
        const netmask = $menu.querySelector("#netmask-dns").value;
        const gateway = $menu.querySelector("#gateway-dns").value;

        if (!isValidIp(ip)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>La IP "${ip}" no es válida.`));
            return;
        }

        if (!isValidIp(netmask)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>La máscara de red "${netmask}" no es válida.`));
            return;
        }

        if (!isValidIp(gateway)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>El puerta de enlace "${gateway}" no es válida.`));
            return;
        }

        configureInterface($serverObject.id, ip, netmask, "enp0s3");
        setDirectRoutingRule($serverObject.id, ip, netmask, "enp0s3");
        $serverObject.setAttribute("data-gateway", gateway);
        setRemoteRoutingRule($serverObject.id, "0.0.0.0", "0.0.0.0", ip, "enp0s3", gateway);
    }

    $serverObject.setAttribute("recursion", isRecursive);

    bodyComponent.render(popupMessage(`Los cambios se han guardado correctamente.`));

}

function closeDnsMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    $menu.querySelector(".basic-section").classList.remove("hidden");
    $menu.reset();
    $menu.style.display = "none";
}
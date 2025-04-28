function dns_server_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("dns-form", "modal");

    $menu.innerHTML = `

        <p id="form-dns-item-id"></p>

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

        <button class="btn-modern-blue dark" type="submit">Guardar</button>
    `;

    $menu.addEventListener("submit", saveDnsSpecs);
    
    return $menu;

}

function showDnsForm(event) {

    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    const $serverObject = event.target.closest(".item-dropped");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess($serverObject.id);
        return;
    }

    const $form = document.querySelector(".dns-form");
    const isRecursive = $serverObject.getAttribute("recursion");
    $form.querySelector("#ip-dns").value = $serverObject.getAttribute("ip-enp0s3");
    $form.querySelector("#netmask-dns").value = $serverObject.getAttribute("netmask-enp0s3");
    $form.querySelector("#gateway-dns").value = $serverObject.getAttribute("data-gateway");
    $form.querySelector("#dns-recursive").checked = isRecursive === "true";
    if (!$serverObject.id.startsWith("dns-server-")) $form.querySelector(".basic-section").classList.add("hidden");
    document.getElementById("form-dns-item-id").innerHTML = $serverObject.id;
    $form.style.display = "flex";
}

function saveDnsSpecs(event) {
    event.preventDefault();
    event.stopPropagation();

    const $form = document.querySelector(".dns-form");
    const $serverObject = document.getElementById($form.querySelector("#form-dns-item-id").innerHTML);
    const isRecursive = $form.querySelector("#dns-recursive").checked;

    if ($serverObject.id.startsWith("dns-server")) {
        const ip = $form.querySelector("#ip-dns").value;
        const netmask = $form.querySelector("#netmask-dns").value;
        const gateway = $form.querySelector("#gateway-dns").value;
        configureInterface($serverObject.id, ip, netmask, "enp0s3");
        setDirectRoutingRule($serverObject.id, ip, netmask, "enp0s3");
        $serverObject.setAttribute("data-gateway", gateway);
        setRemoteRoutingRule($serverObject.id, "0.0.0.0", "0.0.0.0", ip, "enp0s3", gateway);
    }

    $serverObject.setAttribute("recursion", isRecursive);
    $form.querySelector(".basic-section").classList.remove("hidden");
    $form.style.display = "none";
}
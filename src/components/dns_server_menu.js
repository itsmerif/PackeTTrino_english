function dns_server_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("dns-form", "modal");

    $menu.innerHTML = `
        <p id="form-dns-item-id"></p>

        <label for="ip">Dirección IP (IPv4):</label>
        <input type="text" id="ip-dns" name="ip-dns"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="netmask">Máscara de Red:</label>
        <input type="text" id="netmask-dns" name="netmask-dns"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="gateway">Puerta de Enlace:</label>
        <input type="text" id="gateway-dns" name="gateway-dns"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <div class="form-item">
        <label for="dns-recursive">Servidor DNS Recursivo:</label>
        <input class="btn-toggle" type="checkbox" id="dns-recursive" name="dns-recursive">
        </div>

        <button class="btn-modern-green" type="submit">Guardar</button>
    `;

    $menu.addEventListener("submit", saveDnsSpecs);
    
    return $menu;

}

function showDnsForm(event) {
    event.stopPropagation();
    const form = document.querySelector(".dns-form");
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    const $serverObject = event.target.closest(".item-dropped");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess($serverObject.id);
        return;
    }

    const id = $serverObject.id;
    const ip = $serverObject.getAttribute("ip-enp0s3");
    const netmask = $serverObject.getAttribute("netmask-enp0s3");
    const gateway = $serverObject.getAttribute("data-gateway");
    const isRecursive = $serverObject.getAttribute("recursion");
    form.querySelector("#ip-dns").value = ip;
    form.querySelector("#netmask-dns").value = netmask;
    form.querySelector("#gateway-dns").value = gateway;
    form.querySelector("#dns-recursive").checked = isRecursive === "true";
    document.getElementById("form-dns-item-id").innerHTML = id;
    form.style.display = "flex";
}

function saveDnsSpecs(event) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.target.closest("form");
    //tomo los datos del formulario
    const id = form.querySelector("#form-dns-item-id").innerHTML;
    const $serverObject = document.getElementById(id);
    const ip = form.querySelector("#ip-dns").value;
    const netmask = form.querySelector("#netmask-dns").value;
    const gateway = form.querySelector("#gateway-dns").value;
    const isRecursive = form.querySelector("#dns-recursive").checked;
    //actualizo el servidor
    $serverObject.setAttribute("ip-enp0s3", ip);
    $serverObject.setAttribute("netmask-enp0s3", netmask);
    $serverObject.setAttribute("data-gateway", gateway);
    $serverObject.setAttribute("recursion", isRecursive);
    //limpio el formulario
    form.reset();
    form.style.display = "none";
}
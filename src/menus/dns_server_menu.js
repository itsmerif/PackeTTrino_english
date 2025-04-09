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
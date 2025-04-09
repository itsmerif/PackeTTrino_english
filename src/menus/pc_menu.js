function pc_menu() {

    const $menu = document.createElement("form");

    $menu.classList.add("pc-form", "modal");

    $menu.innerHTML = `

        <p id="form-item-id"></p>

        <label for="ip">Dirección IP (ipv4):</label>
        <input type="text" id="ip" name="ip"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="netmask">Máscara de Red:</label>
        <input type="text" id="netmask" name="netmask"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="gateway">Puerta de enlace:</label>
        <input type="text" id="gateway" name="gateway"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="dns-server">Servidor DNS:</label>
        <input type="text" id="dns-server" name="dns-server"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <div class="form-item">
        <label for="dhcp"> Modo DHCP: </label>
        <input class="btn-toggle" type="checkbox" id="dhcp" name="dhcp">
        </div>

        <div class="form-item">
        <label for="wifi"> Modo Wi-Fi: </label>
        <input class="btn-toggle" type="checkbox" id="wifi" name="wifi">
        </div>

        <div class="form-item">
        <label for="web-server"> Servidor Web: </label>
        <input class="btn-toggle" type="checkbox" id="web-server" name="web-server">
        </div>

        <div class="button-container">
        <button class="btn-modern-blue" type="submit" id="save-btn">Guardar</button>
        <button class="btn-modern-blue" type="submit" id="get-btn" style="display: none;">Obtener IP</button>
        <button class="btn-modern-blue" type="submit" id="renew-btn" style="display: none;">Renovar IP</button>
        <button class="btn-modern-blue" type="submit" id="release-btn" style="display: none;">Liberar IP</button>
        </div>

        <button class="btn-modern-red" type="submit" id="close-btn">Cerrar</button>

    `;

    $menu.addEventListener("submit", submitPcForm);
    $menu.querySelector("#dhcp").addEventListener("change", dhcpHandler);

    return $menu;   
    
}
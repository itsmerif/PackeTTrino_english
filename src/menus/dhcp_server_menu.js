function dhcp_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-form", "modal");

    $menu.innerHTML = `
    
        <p id="form-dhcp-item-id"></p>

        <div>
        <label for="ip-dhcp">IP:</label>
        <input type="text" id="ip-dhcp" name="ip-dhcp"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="netmask-dhcp">Netmask:</label>
        <input type="text" id="netmask-dhcp" name="netmask-dhcp"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="gateway-dhcp">Gateway:</label>
        <input type="text" id="gateway-dhcp" name="gateway-dhcp"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <p> Opciones de Servicio </p>

        <div>
        <label for="range-start">Rango de IPs:</label>
        <input type="text" id="range-start" name="range-start"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" id="range-end" name="range-end"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-netmask">Oferta Netmask:</label>
        <input type="text" id="offer-netmask" name="offer-netmask"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-gateway">Oferta Gateway:</label>
        <input type="text" id="offer-gateway" name="offer-gateway"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-dns">Oferta Servidor DNS:</label>
        <input type="text" id="offer-dns" name="offer-dns"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-lease-time">Oferta Tiempo de Alquiler:</label>
        <input type="text" id="offer-lease-time" name="offer-lease-time" pattern="^[0-9]+$">
        </div>

        <button class="btn-modern-blue" type="submit">Guardar</button>

    `;

    $menu.addEventListener("submit", saveDhcpSpecs);
    return $menu;
    
}
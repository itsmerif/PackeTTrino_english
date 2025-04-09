function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal");

    $menu.innerHTML = `
        <p id="form-dhcp-relay-item-id"></p>
        <label for="ip-relay">IP:</label>
        <input type="text" id="ip-relay" name="ip-relay"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="netmask-relay">Netmask:</label>
        <input type="text" id="netmask-relay" name="netmask-relay"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="gateway-relay">Gateway:</label>
        <input type="text" id="gateway-relay" name="gateway-relay"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="main-server">IP del Servidor DHCP Principal:</label>
        <input type="text" id="main-server" name="main-server"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <button class="btn-modern-blue" type="submit">Guardar</button>   
    `;

    $menu.addEventListener("submit", saveDhcpRelaySpecs);

    return $menu;

}
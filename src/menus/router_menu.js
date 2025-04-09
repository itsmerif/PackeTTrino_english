function router_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("router-form", "modal");

    $menu.innerHTML = `

        <p id="form-router-item-id"></p>

        <label for="ip-enp0s3">Interfaz enp0s3:</label>
        <input type="text" id="ip-enp0s3" name="ip-enp0s3"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" name="netmask-enp0s3" id="netmask-enp0s3"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="ip-enp0s8">Interfaz enp0s8:</label>
        <input type="text" id="ip-enp0s8" name="ip-enp0s8"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" name="netmask-enp0s8" id="netmask-enp0s8"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="ip-enp0s9">Interfaz enp0s9:</label>
        <input type="text" id="ip-enp0s9" name="ip-enp0s9"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" name="netmask-enp0s9" id="netmask-enp0s9"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <button class="btn-modern-yellow" type="submit">Guardar</button>

    `;

    
    $menu.addEventListener("submit", saveRouterSpecs);
    
    return $menu;

}
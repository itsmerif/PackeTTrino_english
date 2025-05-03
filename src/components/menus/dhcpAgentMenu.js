function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal", "draggable-modal");

    $menu.innerHTML = `
        <div class="window-frame"> <p id="form-dhcp-relay-item-id"> </p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="ip-relay">Dirección IP (ipv4):</label>
                <input type="text" id="ip-relay" name="ip-relay" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div class="form-item">
                <label for="netmask-relay">Máscara de Red:</label>
                <input type="text" id="netmask-relay" name="netmask-relay" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div class="form-item">
                <label for="gateway-relay">Puerta de enlace:</label>
                <input type="text" id="gateway-relay" name="gateway-relay" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>
        
        </section>

        <section class="dhcp-relay-section">
            <div class="form-item">
                <label for="main-server">Servidor DHCP Principal:</label>
                <input type="text" id="main-server" name="main-server" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>
        </section>
        
        <button class="btn-modern-blue" type="submit">Guardar</button>
        <button class="btn-modern-red"  id="btn-close">Cerrar</button>
    `;

    $menu.addEventListener("submit", saveDhcpRelayMenu);
    $menu.querySelector("#btn-close").addEventListener("click", closeDhcpRelayMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);


    return $menu;

}

function showDhcpRelayMenu(event) {

    event.stopPropagation();

    const networkObject = event.target.closest(".item-dropped");
    const itemId = networkObject.id; //obtenemos el id del elemento
    const $form = document.querySelector(".dhcp-relay-form");
    const isDhcpRelay = itemId.startsWith("dhcp-relay-server-");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(networkObject.id);
        return;
    }

    $form.querySelector("#ip-relay").value = networkObject.getAttribute("ip-enp0s3");
    $form.querySelector("#netmask-relay").value = networkObject.getAttribute("netmask-enp0s3");
    $form.querySelector("#gateway-relay").value = networkObject.getAttribute("data-gateway");;
    $form.querySelector("#main-server").value = networkObject.getAttribute("data-main-server");;
    $form.querySelector("#form-dhcp-relay-item-id").innerHTML = networkObject.id;
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    if (!isDhcpRelay) $form.querySelector(".basic-section").classList.add("hidden");

    $form.style.display = "flex";
}

function saveDhcpRelayMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $networkObject = document.getElementById(document.getElementById("form-dhcp-relay-item-id").innerHTML);
    const $form = document.querySelector(".dhcp-relay-form");
    const newIp = $form.querySelector("#ip-relay").value;
    const newNetmask = $form.querySelector("#netmask-relay").value;
    const newGateway = $form.querySelector("#gateway-relay").value;
    const newMainServer = $form.querySelector("#main-server").value;
    const isDhcpRelay = $networkObject.id.startsWith("dhcp-relay-server-");

    if (isDhcpRelay) { //<-- si es un DHCP Relay nativo, se guarda la configuracion de red basica

        //<-- comprobamos los campos

        if (!isValidIp(newIp)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>La IP "${newIp}" no es válida.`));
            return;
        }

        if (!isValidIp(newNetmask)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>La máscara de red "${newNetmask}" no es válida.`));
            return;
        }

        if (!isValidIp(newGateway)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>El puerta de enlace "${newGateway}" no es válida.`));
            return;
        }

        configureInterface($networkObject.id, newIp, newNetmask, "enp0s3");
        setDirectRoutingRule($networkObject.id, newIp, newNetmask, "enp0s3");
        $networkObject.setAttribute("data-gateway", newGateway);
        setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", newIp, "enp0s3", newGateway);

    }

    if (!isValidIp(newMainServer)) {
        bodyComponent.render(popupMessage(`<span>Error: </span>La IP del Servidor DHCP principal "${newMainServer}" no es válido.`));
        return;
    }

    $networkObject.setAttribute("data-main-server", newMainServer); //<-- se guarda la referencia al servidor DHCP principal

    bodyComponent.render(popupMessage(`Los cambios se han guardado correctamente.`));

}

function closeDhcpRelayMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $form = document.querySelector(".dhcp-relay-form");
    $form.querySelector(".basic-section").classList.remove("hidden");
    $form.reset();
    $form.style.display = "none";  
}
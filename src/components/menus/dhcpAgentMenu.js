function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal", "draggable-modal");

    $menu.innerHTML = `
        <div class="window-frame"> <p id="form-dhcp-relay-item-id"> </p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="ip-relay">Dirección IP (ipv4):</label>
                <input type="text" id="ip-relay" name="ip-relay" placeholder="192.168.1.1">
            </div>

            <div class="form-item">
                <label for="netmask-relay">Máscara de Red:</label>
                <input type="text" id="netmask-relay" name="netmask-relay" placeholder="255.255.255.0">
            </div>

            <div class="form-item">
                <label for="gateway-relay">Puerta de enlace:</label>
                <input type="text" id="gateway-relay" name="gateway-relay" placeholder="192.168.1.1">
            </div>
        
        </section>

        <section class="dhcp-relay-section">

            <div class="form-item">
                <label for="main-server">Servidor DHCP Principal:</label>
                <input type="text" id="main-server" name="main-server" placeholder="172.16.1.254">
            </div>

            <div class="form-item">
                <label for="listen-on-interfaces">Interfaces De Escucha:</label>
                <input type="text" id="listen-on-interfaces" name="listen-on-interfaces" placeholder="enp0s3,enp0s8">
            </div>

        </section>
        
        <div class="button-wrapper">
            <button class="btn-modern-blue" type="submit">Guardar</button>
            <button class="btn-modern-red"  id="close-btn">Cerrar</button>
        </div>
    `;

    $menu.addEventListener("submit", saveDhcpRelayMenu);
    $menu.querySelector("#close-btn").addEventListener("click", closeDhcpRelayMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);


    return $menu;

}

function showDhcpRelayMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");
    const $menu = document.querySelector(".dhcp-relay-form");
    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const isDhcpRelay = $networkObject.id.startsWith("dhcp-relay-server-");

    if (quickPingToggle) {
        quickPing($networkObject.id);
        return;
    }

    //atributos del agente
    $menu.querySelector("#ip-relay").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    $menu.querySelector("#netmask-relay").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    $menu.querySelector("#gateway-relay").value = $networkObject.getAttribute("data-gateway");

    //atributos del servicio
    $menu.querySelector("#main-server").value = $networkObject.getAttribute("dhcrelay-main-server");;
    $menu.querySelector("#listen-on-interfaces").value = $networkObject.getAttribute("dhcrelay-listen-on-interfaces");
    $menu.querySelector("#form-dhcp-relay-item-id").innerHTML = $networkObject.id;

    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    if (!isDhcpRelay) $menu.querySelector(".basic-section").classList.add("hidden");

    $menu.style.display = "flex";
}

function saveDhcpRelayMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $networkObject = document.getElementById(document.getElementById("form-dhcp-relay-item-id").innerHTML);
    const $form = document.querySelector(".dhcp-relay-form");
    const availableInterfaces = getInterfaces($networkObject.id);
    const networkObjectInterface = availableInterfaces[0];
    const newIp = $form.querySelector("#ip-relay").value;
    const newNetmask = $form.querySelector("#netmask-relay").value;
    const newGateway = $form.querySelector("#gateway-relay").value;
    const newMainServer = $form.querySelector("#main-server").value;
    const newListenOnInterfaces = ($form.querySelector("#listen-on-interfaces").value).split(",").map(item => item.trim()).filter(item => item !== "");
    const isDhcpRelay = $networkObject.id.startsWith("dhcp-relay-server-");

    if (isDhcpRelay) { 

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

        configureInterface($networkObject.id, newIp, newNetmask, networkObjectInterface);
        setDirectRoutingRule($networkObject.id, newIp, newNetmask, networkObjectInterface);
        $networkObject.setAttribute("data-gateway", newGateway);
        setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", newIp, networkObjectInterface, newGateway);

    }

    if (!isValidIp(newMainServer)) {
        bodyComponent.render(popupMessage(`<span>Error: </span>La IP del Servidor DHCP principal "${newMainServer}" no es válido.`));
        return;
    }

    if (!newListenOnInterfaces.every(item => availableInterfaces.includes(item))) {
        bodyComponent.render(popupMessage(`<span>Error: </span>Algunas de las interfaces de escucha no son válidas.`));
        return;
    }

    //guardamos los cambios
    $networkObject.setAttribute("dhcrelay-main-server", newMainServer);
    $networkObject.setAttribute("dhcrelay-listen-on-interfaces", newListenOnInterfaces.join(","));

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
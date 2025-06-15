function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `
        <div class="window-frame"> <p class="frame-title"></p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="iface">Interfaz:</label>
                <select id="iface" name="iface"></select>
            </div>

            <div class="form-item">
                <label for="ip">Dirección IP (ipv4):</label>
                <input type="text" id="ip" name="ip">
            </div>

            <div class="form-item">
                <label for="netmask">Máscara de Red:</label>
                <input type="text" id="netmask" name="netmask">
            </div>

            <div class="form-item">
                <label for="gateway">Puerta de enlace:</label>
                <input type="text" id="gateway" name="gateway">
            </div>
        
        </section>

        <section class="dhcp-relay-section">

            <div class="form-item">
                <label for="main-server">Servidor DHCP Principal:</label>
                <input type="text" id="main-server" name="main-server">
            </div>

            <div class="form-item">
                <label for="listen-on-interfaces">Interfaces De Escucha:</label>
                <input type="text" id="listen-on-interfaces" name="listen-on-interfaces">
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
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "dhcp-relay-form"));


    return $menu;

}

function showDhcpRelayMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;

    if (quickPingToggle) {
        quickPing(networkObjectId);
        return;
    }

    //añadimos el identificador del equipo al menú
    const $menu = document.querySelector(".dhcp-relay-form");
    $menu.dataset.id = networkObjectId;

    //obtenemos información del equipo
    const networkObjectInterface = getInterfaces(networkObjectId)[0];
    const isDhcpRelay = networkObjectId.startsWith("dhcp-relay-server-");

    //cargamos las interfaces disponibles
    loadInterfaces("dhcp-relay-form");

    //asignamos los valores del objeto al menú
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    $menu.querySelector("#gateway").value = getDefaultGateway(networkObjectId);
    $menu.querySelector("#main-server").value = $networkObject.getAttribute("dhcrelay-main-server");;
    $menu.querySelector("#listen-on-interfaces").value = $networkObject.getAttribute("dhcrelay-listen-on-interfaces");
    $menu.querySelector(".frame-title").innerHTML = networkObjectId;

    //ocultamos la sección básica para no agentes de retransmisión
    if (!isDhcpRelay) $menu.querySelector(".basic-section").classList.add("hidden");

    //mostramos el menú
    $networkObject.querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";
}

function saveDhcpRelayMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = document.querySelector(".dhcp-relay-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const availableInterfaces = getInterfaces($networkObject.id);
    const networkObjectInterface = $menu.querySelector("#iface").value;
    const newIp = $menu.querySelector("#ip").value;
    const newNetmask = $menu.querySelector("#netmask").value;
    const newGateway = $menu.querySelector("#gateway").value;
    const newMainServer = $menu.querySelector("#main-server").value;
    const newListenOnInterfaces = ($menu.querySelector("#listen-on-interfaces").value)
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
    const isDhcpRelay = $networkObject.id.startsWith("dhcp-relay-server-");

    try {

        if (isDhcpRelay) { 
            if (!isValidIp(newIp)) throw new Error(`Error: La IP "${newIp}" no es válida.`);
            if (!isValidIp(newNetmask)) throw new Error(`Error: La máscara de red "${newNetmask}" no es válida.`);
            if (newGateway !== "" && !isValidIp(newGateway)) throw new Error(`Error: La puerta de enlace "${newGateway}" no es válida.`);
        }

        if (newMainServer !== "" && !isValidIp(newMainServer)) {
            throw new Error(`Error: La IP del Servidor DHCP principal "${newMainServer}" no es válida.`);
        }

        if (newListenOnInterfaces.length !== 0 && !newListenOnInterfaces.every(item => availableInterfaces.includes(item))) {
            throw new Error(`Error: Algunas de las interfaces de escucha no son válidas.`);
        }

        configureInterface($networkObject.id, newIp, newNetmask, networkObjectInterface);
        setDefaultGateway($networkObject.id, newGateway);
        $networkObject.setAttribute("dhcrelay-main-server", newMainServer);
        $networkObject.setAttribute("dhcrelay-listen-on-interfaces", newListenOnInterfaces?.join(","));
        bodyComponent.render(popupMessage(`Los cambios se han guardado correctamente.`));

    }catch(error) {

        bodyComponent.render(popupMessage(error.message));
        return;
    }

}

function closeDhcpRelayMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $form = document.querySelector(".dhcp-relay-form");
    $form.querySelector(".basic-section").classList.remove("hidden");
    $form.reset();
    $form.style.display = "none";  
}
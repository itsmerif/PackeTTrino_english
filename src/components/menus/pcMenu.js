function pc_menu() {

    const $menu = document.createElement("form");

    $menu.classList.add("pc-form", "modal", "draggable-modal");

    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <section class="basic-section">

            <section class="iface-section">

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

            </section>
            
            <section class="general-section">

                <div class="form-item">
                    <label for="gateway">Puerta de enlace:</label>
                    <input type="text" id="gateway" name="gateway">
                </div>
            
                <div class="form-item">
                    <label for="dns-server">Servidores DNS:</label>
                    <input type="text" id="dns-server" name="dns-server">
                </div>

            </section>

        </section>

        <section class="modes-wrapper">

            <div class="form-item hidden" id="dhcp-mode">
                <label for="dhcp-toggle"> Modo DHCP: </label>
                <input class="btn-toggle" type="checkbox" id="dhcp-toggle" name="dhcp-toggle">
            </div>

            <div class="form-item hidden" id="web-server-mode">
                <label for="web-server-toggle"> Servidor Web: </label>
                <input class="btn-toggle" type="checkbox" id="web-server-toggle" name="web-server-toggle">
            </div>

        </section>

        <section class="button-container">

            <div id="dhcp-buttons">
                <button class="btn-modern-blue" type="submit" id="get-btn" style="display: none;">Obtener IP</button>
                <button class="btn-modern-blue" type="submit" id="renew-btn" style="display: none;">Renovar IP</button>
                <button class="btn-modern-blue" type="submit" id="release-btn" style="display: none;">Liberar IP</button>
            </div>
            
            <div id="basic-buttons">
                <button class="btn-modern-blue" type="submit" id="save-btn" style="display: none;">Guardar</button>
                <button class="btn-modern-red"  type="submit" id="close-btn" style="display: none;">Cerrar</button>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", pcMenuButtonsHandler);
    $menu.querySelector("#dhcp-toggle").addEventListener("change", dhcpHandler);
    $menu.querySelector("#web-server-toggle").addEventListener("change", webServerHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#iface").addEventListener("change", interfaceHandler);

    return $menu;

}

function showPcMenu(networkObjectId) {

    if (quickPingToggle) { //esto controla si está usando la utilidad de ping visual
        quickPing(networkObjectId);
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const $menu = document.querySelector(".pc-form");
    $menu.dataset.id = networkObjectId;
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const $buttonSection = $menu.querySelector(".button-container");
    const activeServices = getAvailableServices(networkObjectId);
    
    //cargamos las interfaces disponibles

    const availableInterfaces = getInterfaces(networkObjectId);

    availableInterfaces.forEach(iface => {
        const option = document.createElement("option");
        option.value = iface;
        option.innerHTML = iface;
        $menu.querySelector("#iface").appendChild(option);
    });

    const networkInterface = availableInterfaces[0]; //<-- se selecciona la primera interfaz

    //configuracion basica de red

    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
    $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
    $menu.querySelector("#dns-server").value = (getDnsServers(networkObjectId) ?? "").join(",");
    $menu.querySelector(".frame-title").innerHTML = networkObjectId;

    //comprobamos los servicios activos

    if (activeServices.includes("dhclient")) {

        $menu.querySelector("#dhcp-mode").classList.remove("hidden");

        if ($networkObject.getAttribute("dhclient") === "true") {

            $menu.querySelector("#dhcp-toggle").checked = true;
            $textInputs.forEach(input => input.disabled = true);

            if ($menu.querySelector("#ip").value === "") {
                $buttonSection.querySelector("#get-btn").style.display = "block";
            } else {
                $buttonSection.querySelector("#renew-btn").style.display = "block";
                $buttonSection.querySelector("#release-btn").style.display = "block";
            }

        }

    }

    if (activeServices.includes("apache2")) {
        $menu.querySelector("#web-server-mode").classList.remove("hidden");
        if ($networkObject.getAttribute("apache2") === "true") $menu.querySelector("#web-server-toggle").checked = true;
    }

    $buttonSection.querySelector("#close-btn").style.display = "block";
    $buttonSection.querySelector("#save-btn").style.display = "block";
    $menu.style.display = "flex";
}

async function pcMenuButtonsHandler(event) {

    event.preventDefault();

    const buttonId = event.submitter.id;
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $modules = $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item");
    const $buttons = $menu.querySelector(".button-container").querySelectorAll("button");
    const $ifaceSelector = $menu.querySelector("#iface");
    const networkInterface = $ifaceSelector.value;
    const newIp = $menu.querySelector("#ip").value;
    const newNetmask = $menu.querySelector("#netmask").value;
    const newGateway = $menu.querySelector("#gateway").value;
    const newDnsServers = ($menu.querySelector("#dns-server").value).split(",").map(ip => ip.trim()).filter(ip => ip !== "");
    const isEmptyForm = newIp === "" && newNetmask === "" && newGateway === "" && newDnsServers.length === 0;

    //funciones del menú

    const validateForm = () => {
        if (!isValidIp(newIp)) throw new Error(`Error: La IP "${newIp}" no es valida.`);
        if (!isValidIp(newNetmask)) throw new Error(`Error: La máscara de red "${newNetmask}" no es valida.`);
        if (newGateway !== "" && !isValidIp(newGateway)) throw new Error(`Error: La puerta de enlace "${newGateway}" no es valida.`);
        if (newDnsServers.length !== 0 && !newDnsServers.every(isValidIp)) throw new Error(`Error: Servidores DNS no válidos.`);
    }

    const updatePcFormFields = () => {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
        $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
        $menu.querySelector("#dns-server").value = (getDnsServers($networkObject.id) ?? "").join(",");
    }

    const updateButtonDisplay = () => {
        const isDhcpOn = $networkObject.getAttribute("dhclient") === "true";
        const hasIp = $networkObject.getAttribute(`ip-${networkInterface}`) !== "";
        $menu.querySelector("#get-btn").style.display = (isDhcpOn && !hasIp) ? "block" : "none";
        $menu.querySelector("#renew-btn").style.display = (isDhcpOn && hasIp) ? "block" : "none";
        $menu.querySelector("#release-btn").style.display = (isDhcpOn && hasIp) ? "block" : "none";
    }

    const restorePcForm = () => {
        const $textInputs = $menu.querySelectorAll("input[type='text']");
        const $checkBoxes = $menu.querySelectorAll("input[type='checkbox']");
        $ifaceSelector.innerHTML = ""; //<-- se limpia el selector de interfaz
        $modules.forEach($module => $module.classList.add("hidden")); //<-- se ocultan los modulos
        $buttons.forEach(button => button.style.display = "none"); //<-- se ocultan los botones
        $checkBoxes.forEach(input => input.checked = false); //<-- se desmarcan los checkboxes
        $textInputs.forEach(input => input.disabled = false); //<-- se habilitan los campos de texto
        $menu.style.display = "none"; //<-- se oculta el menu
    }

    const buttonFunctions = {

        "save-btn": () => {
            if (!isEmptyForm) validateForm();
            configureInterface($networkObject.id, newIp, newNetmask, networkInterface);
            setDefaultGateway($networkObject.id, newGateway);
            setDnsServers($networkObject.id, newDnsServers);
            bodyComponent.render(popupMessage("Los cambios se han aplicado correctamente."));
        },

        "get-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpDiscoverHandler($networkObject.id, networkInterface);
        },

        "renew-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpRenewHandler($networkObject.id, "T1", networkInterface);
        },

        "release-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpReleaseHandler($networkObject.id, networkInterface);
        }

    }
    
    //ejecutamos la función correspondiente

    try {
        if (buttonId in buttonFunctions) await buttonFunctions[buttonId]();
    }catch(error) {
        console.log(error);
        bodyComponent.render(popupMessage(error.message));
        return;
    }

    if (buttonId === "close-btn") {
        restorePcForm();
        return;
    }

    updatePcFormFields();
    updateButtonDisplay();

}

function dhcpHandler(event) {

    const $dhcpToggle = event.target;
    const $menu = document.querySelector(".pc-form");
    const $buttonSection = $menu.querySelector(".button-container");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const hasIp = $menu.querySelector("#ip").value !== "";

    if (!$dhcpToggle.checked) {

        $textInputs.forEach(input => input.disabled = false);
        $networkObject.setAttribute("dhclient", false);
        $buttonSection.querySelector("#get-btn").style.display = "none";
        $buttonSection.querySelector("#renew-btn").style.display = "none";
        $buttonSection.querySelector("#release-btn").style.display = "none";

    } else {

        $textInputs.forEach(input => input.disabled = true);
        $networkObject.setAttribute("dhclient", true);

        if (hasIp) {
            $buttonSection.querySelector("#renew-btn").style.display = "block";
            $buttonSection.querySelector("#release-btn").style.display = "block";
        } else {
            $buttonSection.querySelector("#get-btn").style.display = "block";
        }

    }

}

function webServerHandler(event) {

    const $webServerToggle = event.target;
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $networkObjectIcon = $networkObject.querySelector("img");

    if (!$webServerToggle.checked) {
        $networkObject.setAttribute("apache2", false);
        $networkObjectIcon.src = "./assets/board/pc.svg";
    } else {
        $networkObject.setAttribute("apache2", true);
        $networkObjectIcon.src = "./assets/board/www-server.svg";
    }

}

function interfaceHandler(event) {
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $ifaceSelector = $menu.querySelector("#iface");
    const networkInterface = $ifaceSelector.value;
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
}
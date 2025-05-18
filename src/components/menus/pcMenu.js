function pc_menu() {

    const $menu = document.createElement("form");

    $menu.classList.add("pc-form", "modal", "draggable-modal");

    $menu.innerHTML = `

        <div class="window-frame"> <p id="form-item-id"></p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="ip">Dirección IP (ipv4):</label>
                <input type="text" id="ip" name="ip"
                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div class="form-item">
                <label for="netmask">Máscara de Red:</label>
                <input type="text" id="netmask" name="netmask"
                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>
            
            <div class="form-item">
                <label for="gateway">Puerta de enlace:</label>
                <input type="text" id="gateway" name="gateway"
                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>
        
            <div class="form-item">
                <label for="dns-server">Servidor DNS:</label>
                <input type="text" id="dns-server" name="dns-server"
                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

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

    return $menu;

}

function showPcMenu(networkObjectId) {

    if (icmpTryoutToggle) { //esto controla si está usando la utilidad de ping visual
        icmpTryoutProcess(networkObjectId);
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const $menu = document.querySelector(".pc-form");
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const $buttonSection = $menu.querySelector(".button-container");
    const activeServices = getAvailableServices(networkObjectId);
    const networkInterface = getInterfaces(networkObjectId)[0];
    
    //<-- configuracion basica de red

    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
    $menu.querySelector("#gateway").value = $networkObject.getAttribute("data-gateway");
    $menu.querySelector("#dns-server").value = $networkObject.getAttribute("data-dns-server");
    $menu.querySelector("#form-item-id").innerHTML = networkObjectId;

    if (activeServices.includes("dhclient")) {

        $menu.querySelector("#dhcp-mode").classList.remove("hidden"); 

        if ($networkObject.getAttribute("dhclient") === "true") {

            $menu.querySelector("#dhcp-toggle").checked = true;
            $textInputs.forEach(input => input.disabled = true);

            if ($menu.querySelector("#ip").value === "") {
                $buttonSection.querySelector("#get-btn").style.display = "block";
            }else {
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

    var buttonId = event.submitter.id;
    var $networkObject = document.getElementById(document.getElementById("form-item-id").innerHTML);
    var $menu = document.querySelector(".pc-form");
    var $modules = $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item");
    var $buttons = $menu.querySelector(".button-container").querySelectorAll("button");
    var networkInterface = getInterfaces($networkObject.id)[0]; 
    var newIp = $menu.querySelector("#ip").value;
    var newNetmask = $menu.querySelector("#netmask").value;
    var newGateway = $menu.querySelector("#gateway").value;
    var newDnsServer = $menu.querySelector("#dns-server").value;

    var buttonFunctions = {

        "save-btn": () => {
            configureInterface($networkObject.id, newIp, newNetmask, networkInterface); //<-- configuramos la interfaz
            setDirectRoutingRule($networkObject.id, newIp, newNetmask, networkInterface); //<-- añadimos la regla de enrutamiento directo
            $networkObject.setAttribute("data-gateway", newGateway); //<-- configuramos la puerta de enlace
            setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", newIp, networkInterface, newGateway); //<-- añadimos la regla por defecto
            $networkObject.setAttribute("data-dns-server", newDnsServer); //<-- configuramos el servidor DNS
            bodyComponent.render(popupMessage("Los cambios se han aplicado correctamente."));
        },

        "get-btn": async () => { 
            if (visualToggle) document.querySelector(".pc-form").style.display = "none";
            await dhcpDiscoverHandler($networkObject.id); //<-- iniciamos el proceso de DHCP discover
        },

        "renew-btn": async () => {
            if (visualToggle) document.querySelector(".pc-form").style.display = "none";
            await dhcpRenewHandler($networkObject.id); //<-- iniciamos el proceso de dhcp renew
        },

        "release-btn": async () => {
            if (visualToggle) document.querySelector(".pc-form").style.display = "none";
            await dhcpReleaseHandler($networkObject.id); //<-- iniciamos el proceso de dhcp release
        }

    }

    var updatePcFormFields = () => {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
        $menu.querySelector("#gateway").value = $networkObject.getAttribute("data-gateway");
        $menu.querySelector("#dns-server").value = $networkObject.getAttribute("data-dns-server");
    }

    var updateButtonDisplay = () => {
        const isDhcpOn = $networkObject.getAttribute("dhclient") === "true";
        const hasIp = $networkObject.getAttribute(`ip-${networkInterface}`) !== "";
        $menu.querySelector("#get-btn").style.display = (isDhcpOn && !hasIp) ? "block" : "none";
        $menu.querySelector("#renew-btn").style.display = (isDhcpOn && hasIp) ? "block" : "none";
        $menu.querySelector("#release-btn").style.display = (isDhcpOn && hasIp) ? "block" : "none";
    }

    var restorePcForm = () => {
        const $textInputs = $menu.querySelectorAll("input[type='text']");
        const $checkBoxes = $menu.querySelectorAll("input[type='checkbox']");
        $modules.forEach($module => $module.classList.add("hidden")); //<-- se ocultan los modulos
        $buttons.forEach(button => button.style.display = "none"); //<-- se ocultan los botones
        $checkBoxes.forEach(input => input.checked = false); //<-- se desmarcan los checkboxes
        $textInputs.forEach(input => input.disabled = false); //<-- se habilitan los campos de texto
        $menu.style.display = "none"; //<-- se oculta el menu
    }
      
    if (buttonId in buttonFunctions) await buttonFunctions[buttonId]();
    
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
    const $networkObject = document.getElementById($menu.querySelector("#form-item-id").innerHTML);
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
    const $networkObject = document.getElementById($menu.querySelector("#form-item-id").innerHTML);
    const $networkObjectIcon = $networkObject.querySelector("img");

    if (!$webServerToggle.checked) {
        $networkObject.setAttribute("apache2", false);
        $networkObjectIcon.src = "./assets/board/pc.svg"; 
    } else {
        $networkObject.setAttribute("apache2", true);
        $networkObjectIcon.src = "./assets/board/www-server.svg";
    }

}


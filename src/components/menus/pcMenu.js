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
    const $buttonSection = $menu.querySelector(".button-container"); //<-- seccion de botones
    const activeServices = getAvailableServices(networkObjectId);
    const networkInterface = getInterfaces(networkObjectId)[0]; //<-- nos quedamos con la primera interfaz (por ahora)
    
    //<-- configuracion basica de red

    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
    $menu.querySelector("#gateway").value = $networkObject.getAttribute("data-gateway");
    $menu.querySelector("#dns-server").value = $networkObject.getAttribute("data-dns-server");
    $menu.querySelector("#form-item-id").innerHTML = networkObjectId;

    if (activeServices.includes("dhclient")) {

        if ($networkObject.getAttribute("dhclient") === "true") {

            $menu.querySelector("#dhcp-toggle").checked = true;
            $textInputs.forEach(input => input.disabled = true); //<-- bloqueamos la configuración manual de la interfaz

            if ($menu.querySelector("#ip").value === "") {  //<-- si no tenemos una IP asignada, solo se muestra el botón de "Obtener IP"

                $buttonSection.querySelector("#get-btn").style.display = "block";

            }else { //<-- si tenemos una IP asignada, se muestran los botones de "Renovar IP" y "Liberar IP"

                $buttonSection.querySelector("#renew-btn").style.display = "block";
                $buttonSection.querySelector("#release-btn").style.display = "block";

            }

        } else {

            $menu.querySelector("#dhcp-toggle").checked = false;

        }

        $menu.querySelector("#dhcp-mode").classList.remove("hidden"); //<-- mostramos el modulo de DHCP

    }

    if (activeServices.includes("apache")) { 

        if ($networkObject.getAttribute("apache") === "true") $menu.querySelector("#web-server-toggle").checked = true;
        else $menu.querySelector("#web-server-toggle").checked = false;

        $menu.querySelector("#web-server-mode").classList.remove("hidden"); //<-- mostramos el modulo de Apache
        
    }
    
    $buttonSection.querySelector("#close-btn").style.display = "block"; //<-- mostramos el boton de cerrar
    $buttonSection.querySelector("#save-btn").style.display = "block"; //<-- mostramos el boton de guardar
    $menu.style.display = "flex"; //<-- mostramos el menu
}

async function pcMenuButtonsHandler(event) {

    event.preventDefault();

    var buttonId = event.submitter.id;
    var $networkObject = document.getElementById(document.getElementById("form-item-id").innerHTML);
    var $menu = document.querySelector(".pc-form");
    var $modules = $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item");
    var $buttons = $menu.querySelector(".button-container").querySelectorAll("button");
    var $networkObjectIcon = $networkObject.querySelector("img");
    var networkInterface = getInterfaces($networkObject.id)[0]; //<-- nos quedamos con la primera interfaz (por ahora)
    var networkObjectServices = getAvailableServices($networkObject.id);

    //recuperamos la información del menu
    
    var newIp = $menu.querySelector("#ip").value;
    var newNetmask = $menu.querySelector("#netmask").value;
    var newGateway = $menu.querySelector("#gateway").value;
    var newDnsServer = $menu.querySelector("#dns-server").value;
    var isDhcpOn = $menu.querySelector("#dhcp-toggle").checked;
    var isWebServerOn = $menu.querySelector("#web-server-toggle").checked;

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
        $modules.forEach($module => $module.classList.add("hidden"));
        $buttons.forEach(button => button.style.display = "none");
        $menu.style.display = "none";
    }

    if(networkObjectServices.includes("dhclient") ) $networkObject.setAttribute("dhclient", isDhcpOn);
    
    if(networkObjectServices.includes("apache") ) $networkObject.setAttribute("apache", isWebServerOn);
    
    if (isWebServerOn) $networkObjectIcon.src = "./assets/board/www-server.svg"; 
    
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


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
                <label for="dhcp"> Modo DHCP: </label>
                <input class="btn-toggle" type="checkbox" id="dhcp" name="dhcp">
            </div>

            <div class="form-item hidden" id="web-server-mode">
                <label for="web-server"> Servidor Web: </label>
                <input class="btn-toggle" type="checkbox" id="web-server" name="web-server">
            </div>

        </section>

        <section class="button-container">

            <button class="btn-modern-blue" type="submit" id="save-btn" style="display: none;">Guardar</button>
            <button class="btn-modern-blue" type="submit" id="get-btn" style="display: none;">Obtener IP</button>
            <button class="btn-modern-blue" type="submit" id="renew-btn" style="display: none;">Renovar IP</button>
            <button class="btn-modern-blue" type="submit" id="release-btn" style="display: none;">Liberar IP</button>
            <button class="btn-modern-red"  type="submit" id="close-btn" style="display: none;">Cerrar</button>

        </section>

    `;

    $menu.addEventListener("submit", pcMenuButtonsHandler);
    $menu.querySelector("#dhcp").addEventListener("change", dhcpHandler);
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

    if (activeServices.includes("dhclient")) { //<-- comprueba si existe el servicio dhcp cliente

        if ($networkObject.getAttribute("dhclient") === "true") { //<-- comprobamos si el servicio esta activo

            $menu.querySelector("#dhcp").checked = true;
            $textInputs.forEach(input => input.disabled = true); //<-- bloqueamos la configuración manual de la interfaz

            if (!$menu.querySelector("#ip").value) {  //<-- si no tenemos una IP asignada, solo se muestra el botón de "Obtener IP"

                $buttonSection.querySelector("#get-btn").style.display = "block";

            }else { //<-- si tenemos una IP asignada, se muestran los botones de "Renovar IP" y "Liberar IP"

                $buttonSection.querySelector("#renew-btn").style.display = "block";
                $buttonSection.querySelector("#release-btn").style.display = "block";

            }

        }

        $menu.querySelector("#dhcp-mode").classList.remove("hidden"); //<-- mostramos el modulo de DHCP

    }

    if (activeServices.includes("apache")) { //<-- comprobamos si existe el servicio Apache

        if ($networkObject.getAttribute("apache") === "true") $menu.querySelector("#web-server").checked = true;

        $menu.querySelector("#web-server-mode").classList.remove("hidden"); //<-- mostramos el modulo de Apache
        
    }
    
    $buttonSection.querySelector("#save-btn").style.display = "block"; //<-- mostramos el boton de guardar
    $buttonSection.querySelector("#close-btn").style.display = "block"; //<-- mostramos el boton de cerrar
    $menu.style.display = "flex"; //<-- mostramos el menu
}

async function pcMenuButtonsHandler(event) {

    event.preventDefault();

    const $networkObject = document.getElementById(document.getElementById("form-item-id").innerHTML);
    const $networkObjectIcon = $networkObject.querySelector("img");
    const networkInterface = getInterfaces($networkObject.id)[0]; //<-- nos quedamos con la primera interfaz (por ahora)
    const networkObjectServices = getAvailableServices($networkObject.id);
    const $menu = document.querySelector(".pc-form");

    //recuperamos la información del menu
    
    const newIp = $menu.querySelector("#ip").value;
    const newNetmask = $menu.querySelector("#netmask").value;
    const newGateway = $menu.querySelector("#gateway").value;
    const newDnsServer = $menu.querySelector("#dns-server").value;
    const isDhcpOn = $menu.querySelector("#dhcp").checked;
    const isWebServerOn = $menu.querySelector("#web-server").checked;

    const buttonFunctions = { //<-- diccionario de funciones para los botones

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
        },

        "close-btn": () => {
            restorePcForm();
        }

    }

    if(networkObjectServices.includes("dhcpd") ) $networkObject.setAttribute("dhcpd", isDhcpOn);
    if(networkObjectServices.includes("apache") ) $networkObject.setAttribute("apache", isWebServerOn);
    if (isWebServerOn) $networkObjectIcon.src = "./assets/board/www-server.svg"; //<-- si se activa el servicio de Apache, cambiamos el icono del equipo

    //ejecutamos la función correspondiente al botón
    (event.submitter.id in buttonFunctions) ? buttonFunctions[event.submitter.id]() : buttonFunctions["save-btn"]();
}

function dhcpHandler(event) {

    const $dhcpToggle = event.target;
    const $buttonSection = document.querySelector(".pc-form .button-container");
    const $textInputs = document.querySelector(".pc-form").querySelectorAll("input[type='text']");
    const hasIp = document.querySelector(".pc-form #ip").value !== "";

    if (!$dhcpToggle.checked) {

        $textInputs.forEach(input => input.disabled = false);

        $buttonSection.querySelector("#get-btn").style.display = "none";
        $buttonSection.querySelector("#renew-btn").style.display = "none";
        $buttonSection.querySelector("#release-btn").style.display = "none";

    } else {

        $textInputs.forEach(input => input.disabled = true);

        if (hasIp) {

            $buttonSection.querySelector("#renew-btn").style.display = "block";
            $buttonSection.querySelector("#release-btn").style.display = "block";

        } else {

            $buttonSection.querySelector("#get-btn").style.display = "block";

        }

    }

}

function restorePcForm() {

    const $menu = document.querySelector(".pc-form");
    const $modules = $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item");
    const $buttons = $menu.querySelector(".button-container").querySelectorAll("button");

    $modules.forEach($module => $module.classList.add("hidden"));
    $buttons.forEach(button => button.style.display = "none");
    $menu.style.display = "none"; //<-- ocultamos el menu

}  
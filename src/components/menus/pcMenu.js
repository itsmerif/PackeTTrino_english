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

            <button class="btn-modern-blue" type="submit" id="save-btn">Guardar</button>
            <button class="btn-modern-blue" type="submit" id="get-btn" style="display: none;">Obtener IP</button>
            <button class="btn-modern-blue" type="submit" id="renew-btn" style="display: none;">Renovar IP</button>
            <button class="btn-modern-blue" type="submit" id="release-btn" style="display: none;">Liberar IP</button>
            <button class="btn-modern-red"  type="submit" id="close-btn">Cerrar</button>

        </section>

    `;

    $menu.addEventListener("submit", savePcMenu);
    $menu.querySelector("#dhcp").addEventListener("change", dhcpHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);

    return $menu;

}

function showPcMenu(id) {

    if (icmpTryoutToggle) { //esto controla si está usando la utilidad de ping visual
        icmpTryoutProcess(id);
        return;
    }

    const $networkObject = document.getElementById(id);
    const $menu = document.querySelector(".pc-form");
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const $buttonSection = $menu.querySelector(".button-container"); //<-- seccion de botones
    $buttonSection.querySelectorAll("button").forEach(button => button.style.display = "none"); //<-- ocultamos todos los botones al inicio

    //<-- configuracion basica de red
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const gateway = $networkObject.getAttribute("data-gateway");
    const dnsServer = $networkObject.getAttribute("data-dns-server");
    const activeServices = getActiveServices(id);
    $menu.querySelector("#ip").value = ip;
    $menu.querySelector("#netmask").value = netmask;
    $menu.querySelector("#gateway").value = gateway;
    $menu.querySelector("#dns-server").value = dnsServer;
    $menu.querySelector("#form-item-id").innerHTML = id;

    if (activeServices.includes("dhclient")) { //<-- comprueba si existe el servicio dhcp cliente

        if ($networkObject.getAttribute("dhclient") === "true") { //<-- comprobamos si el servicio esta activo

            $menu.querySelector("#dhcp").checked = true;
            $textInputs.forEach(input => input.disabled = true);

            if (!ip) { 
                $buttonSection.querySelector("#get-btn").style.display = "block";
            }else {
                $buttonSection.querySelector("#renew-btn").style.display = "block";
                $buttonSection.querySelector("#release-btn").style.display = "block";
            }
        }

        $menu.querySelector("#dhcp-mode").classList.remove("hidden");
    }

    if (activeServices.includes("apache")) { //<-- comprobamos si existe el servicio web server

        if ($networkObject.getAttribute("apache") === "true") $menu.querySelector("#web-server").checked = true;

        $menu.querySelector("#web-server-mode").classList.remove("hidden");
        
    }
    
    $buttonSection.querySelector("#save-btn").style.display = "block"; //<-- mostramos el boton de guardar
    $buttonSection.querySelector("#close-btn").style.display = "block"; //<-- mostramos el boton de cerrar
    document.querySelector(".pc-form").style.display = "flex"; //<-- mostramos el formulario
}

async function savePcMenu(event) {

    event.preventDefault();

    const $networkObject = document.getElementById(document.getElementById("form-item-id").innerHTML);
    const $networkObjectIcon = $networkObject.querySelector("img");
    const newIp = document.querySelector(".pc-form #ip").value;
    const newNetmask = document.querySelector(".pc-form #netmask").value;
    const newGateway = document.querySelector(".pc-form #gateway").value;
    const isDhcpOn = document.querySelector(".pc-form #dhcp").checked;
    const isWebServerOn = document.querySelector(".pc-form #web-server").checked;
    const newDnsServer = document.querySelector(".pc-form #dns-server").value;

    const buttonFunctions = {

        "save-btn": () => {
            configureInterface($networkObject.id, newIp, newNetmask, "enp0s3");
            setDirectRoutingRule($networkObject.id, newIp, newNetmask, "enp0s3");
            $networkObject.setAttribute("data-gateway", newGateway);
            setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", newIp, "enp0s3", newGateway);
            $networkObject.setAttribute("data-dns-server", newDnsServer);
            bodyComponent.render(popupMessage("Los cambios se han aplicado correctamente."));
        },

        "get-btn": async () => {
            if (visualToggle) document.querySelector(".pc-form").style.display = "none";
            await command_Dhcp($networkObject.id, ["dhcp", "-discover"]);
        },

        "renew-btn": async () => {
            if (visualToggle) document.querySelector(".pc-form").style.display = "none";
            await command_Dhcp($networkObject.id, ["dhcp", "-renew"]);
        },

        "release-btn": async () => {
            if (visualToggle) document.querySelector(".pc-form").style.display = "none";
            await command_Dhcp($networkObject.id, ["dhcp", "-release"]);
        },

        "close-btn": () => {
            restorePcForm();
            document.querySelector(".pc-form").style.display = "none";
        }
    }

    $networkObject.setAttribute("dhclient", isDhcpOn);
    $networkObject.setAttribute("apache", isWebServerOn);
    $networkObjectIcon.src = (isWebServerOn) ? "./assets/board/www-server.svg" : "./assets/board/pc.svg";
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

    $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item").forEach(item => {
        item.classList.add("hidden");
        item.querySelectorAll(".btn-toggle").forEach(btn => btn.checked = false);
    });

    $menu.querySelector(".button-container").querySelectorAll("button").forEach( button => { 
        if (button.id !== "close-btn" && button.id !== "save-btn") button.style.display = "none";
    });

}
function pc_menu() {

    const $menu = document.createElement("form");

    $menu.classList.add("pc-form", "modal");

    $menu.innerHTML = `

        <p id="form-item-id"></p>

        <label for="ip">Dirección IP (ipv4):</label>
        <input type="text" id="ip" name="ip"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="netmask">Máscara de Red:</label>
        <input type="text" id="netmask" name="netmask"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="gateway">Puerta de enlace:</label>
        <input type="text" id="gateway" name="gateway"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="dns-server">Servidor DNS:</label>
        <input type="text" id="dns-server" name="dns-server"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <div class="modes-wrapper">

            <div class="form-item hidden" id="dhcp-mode">
                <label for="dhcp"> Modo DHCP: </label>
                <input class="btn-toggle" type="checkbox" id="dhcp" name="dhcp">
            </div>

            <div class="form-item hidden" id="web-server-mode">
                <label for="web-server"> Servidor Web: </label>
                <input class="btn-toggle" type="checkbox" id="web-server" name="web-server">
            </div>

        </div>

        <div class="button-container">
        <button class="btn-modern-blue" type="submit" id="save-btn">Guardar</button>
        <button class="btn-modern-blue" type="submit" id="get-btn" style="display: none;">Obtener IP</button>
        <button class="btn-modern-blue" type="submit" id="renew-btn" style="display: none;">Renovar IP</button>
        <button class="btn-modern-blue" type="submit" id="release-btn" style="display: none;">Liberar IP</button>
        </div>

        <button class="btn-modern-red" type="submit" id="close-btn">Cerrar</button>

    `;

    $menu.addEventListener("submit", submitPcForm);
    $menu.querySelector("#dhcp").addEventListener("change", dhcpHandler);

    return $menu;

}

function showPcForm(id) {

    if (icmpTryoutToggle) { //esto controla si está usando la utilidad de ping visual
        icmpTryoutProcess(id);
        return;
    }

    const $networkObject = document.getElementById(id);
    const $menu = document.querySelector(".pc-form");
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const $buttons = $menu.querySelector(".button-container").querySelectorAll("button");
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const gateway = $networkObject.getAttribute("data-gateway");
    const dnsServer = $networkObject.getAttribute("data-dns-server");
    const activeServices = getactiveServices(id);

    $menu.querySelector("#ip").value = ip;
    $menu.querySelector("#netmask").value = netmask;
    $menu.querySelector("#gateway").value = gateway;
    $menu.querySelector("#dns-server").value = dnsServer;
    $menu.querySelector("#form-item-id").innerHTML = id;

    if (activeServices.includes("dhclient")) {

        if ($networkObject.getAttribute("dhclient") === "true") {
            $menu.querySelector("#dhcp").checked = true;
            $textInputs.forEach(input => input.disabled = true);
            if (!ip) $buttons.forEach(button => (button.id === "get-btn") ? button.style.display = "block" : button.style.display = "none");
            else $buttons.forEach(button => (button.id === "renew-btn" || button.id === "release-btn") ? button.style.display = "block" : button.style.display = "none");
        }

        $menu.querySelector("#dhcp-mode").classList.remove("hidden");
    }

    if (activeServices.includes("apache")) {

        if ($networkObject.getAttribute("apache") === "true") $menu.querySelector("#web-server").checked = true;
        $menu.querySelector("#web-server-mode").classList.remove("hidden");
        
    }

    document.querySelector(".pc-form").style.display = "flex";
}

async function submitPcForm(event) {

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
            $networkObject.setAttribute("ip-enp0s3", newIp);
            $networkObject.setAttribute("netmask-enp0s3", newNetmask);
            $networkObject.setAttribute("data-gateway", newGateway);
            $networkObject.setAttribute("data-dns-server", newDnsServer);
            restorePcForm();
            document.querySelector(".pc-form").style.display = "none";
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
    const $buttons = document.querySelectorAll(".pc-form .button-container button");
    const $textInputs = document.querySelector(".pc-form").querySelectorAll("input[type='text']");
    const hasIp = document.querySelector(".pc-form #ip").value !== "";

    if (!$dhcpToggle.checked) {
        $textInputs.forEach(input => input.disabled = false);
        $buttons.forEach(button => (button.id !== "save-btn") ? button.style.display = "none" : button.style.display = "block");
    } else {
        $textInputs.forEach(input => input.disabled = true);
        if (hasIp) $buttons.forEach(button => (button.id === "renew-btn" || button.id === "release-btn") ? button.style.display = "block" : button.style.display = "none");
        else $buttons.forEach(button => (button.id === "get-btn") ? button.style.display = "block" : button.style.display = "none");
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
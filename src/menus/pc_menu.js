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

        <div class="form-item">
        <label for="dhcp"> Modo DHCP: </label>
        <input class="btn-toggle" type="checkbox" id="dhcp" name="dhcp">
        </div>

        <div class="form-item">
        <label for="wifi"> Modo Wi-Fi: </label>
        <input class="btn-toggle" type="checkbox" id="wifi" name="wifi">
        </div>

        <div class="form-item">
        <label for="web-server"> Servidor Web: </label>
        <input class="btn-toggle" type="checkbox" id="web-server" name="web-server">
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

    if (icmpTryoutToggle) {
        icmpTryoutProcess(id);
        return;
    }

    const $networkObject = document.getElementById(id);
    const $textInputs = document.querySelector(".pc-form").querySelectorAll("input[type='text']");
    const $buttons = document.querySelectorAll(".pc-form .button-container button");
    const ip = $networkObject.getAttribute("ip-enp0s3");
    const netmask = $networkObject.getAttribute("netmask-enp0s3");
    const gateway = $networkObject.getAttribute("data-gateway");
    const dnsServer = $networkObject.getAttribute("data-dns-server");
    const isDhcpOn = $networkObject.getAttribute("dhclient");
    const isWebServerOn = $networkObject.getAttribute("apache");

    document.querySelector(".pc-form #ip").value = ip;
    document.getElementById("form-item-id").innerHTML = id;
    document.querySelector(".pc-form #netmask").value = netmask;
    document.querySelector(".pc-form #gateway").value = gateway;
    document.querySelector(".pc-form #dns-server").value = dnsServer;

    if (isDhcpOn === "true") {
        document.querySelector(".pc-form #dhcp").checked = true;
        $textInputs.forEach(input => input.disabled = true);
        if (!ip) $buttons.forEach(button => (button.id === "get-btn") ? button.style.display = "block" : button.style.display = "none");
        else $buttons.forEach(button => (button.id === "renew-btn" || button.id === "release-btn") ? button.style.display = "block" : button.style.display = "none");
    } else {
        document.querySelector(".pc-form #dhcp").checked = false;
        $textInputs.forEach(input => input.disabled = false);
        $buttons.forEach(button => (button.id === "save-btn") ? button.style.display = "block" : button.style.display = "none");
    }

    (isWebServerOn === "true") ? document.querySelector(".pc-form #web-server").checked = true : document.querySelector(".pc-form #web-server").checked = false;
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
            document.querySelector(".pc-form").style.display = "none";
        },

        "get-btn": async () => {
            await command_Dhcp($networkObject.id, ["dhcp", "-discover"]);
        },

        "renew-btn": async () => {
            await command_Dhcp($networkObject.id, ["dhcp", "-renew"]);
        },

        "release-btn": async () => {
            await command_Dhcp($networkObject.id, ["dhcp", "-release"]);
        },

        "close-btn": () => {
            document.querySelector(".pc-form").style.display = "none";
        }
    }

    $networkObject.setAttribute("dhclient", isDhcpOn);
    $networkObject.setAttribute("apache", isWebServerOn);
    $networkObjectIcon.src = (isWebServerOn) ? "./assets/board/www-server.svg" : "./assets/board/pc.svg";
    if (visualToggle) document.querySelector(".pc-form").style.display = "none";
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
        return;
    }

    $textInputs.forEach(input => input.disabled = true);
    if (hasIp) $buttons.forEach(button => (button.id === "renew-btn" || button.id === "release-btn") ? button.style.display = "block" : button.style.display = "none");
    else $buttons.forEach(button => (button.id === "get-btn") ? button.style.display = "block" : button.style.display = "none");

}
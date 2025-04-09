function createPcObject(x, y) {

    const $board = document.querySelector(".board");
    const $networkObject = document.createElement("article");
    const $icon = document.createElement("img");
    const $arpTable = document.createElement("article");
    const $dnsTable = document.createElement("article");
    const $firewallTable = document.createElement("article");
    const $advancedOptions = document.createElement("div");

    //caracteristicas generales

    $networkObject.id = `pc-${itemIndex}`;
    [x, y] = checkObjectClip(x, y);
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "pc");
    $networkObject.setAttribute("ip-enp0s3", "");
    $networkObject.setAttribute("netmask-enp0s3", "");
    $networkObject.setAttribute("data-mac", getRandomMac());
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-switch-enp0s3", "");
    $networkObject.setAttribute("data-etc-hosts", `{ "127.0.0.1": ["localhost"] }`);
    $networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    $networkObject.setAttribute("dhclient", "false");
    $networkObject.setAttribute("apache", "false");
    $networkObject.setAttribute("resolved", "true");

    //atributos de servicios

    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-dhcp-lease-time", "");
    $networkObject.setAttribute("web-content", "");

    //icono

    $icon.src = "./assets/board/pc.svg";
    $icon.alt = "pc";
    $icon.draggable = true;

    //tabla arp

    $arpTable.classList.add("arp-table");
    $arpTable.innerHTML = `
        <table>
            <tr>
                <th>IP Address</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeARPTable(event)">Cerrar</button>
    `;

    $arpTable.setAttribute("onclick", "event.stopPropagation();");

    //tabla de registros dns

    $dnsTable.classList.add("dns-table");
    $dnsTable.innerHTML = `
                <table>
                    <tr>
                        <th>Domain</th>
                        <th>Type</th>
                        <th>Value</th>
                    </tr>
                </table>
                <button onclick="closeDnsTable(event)">Cerrar</button>
    `;

    $dnsTable.setAttribute("onclick", "event.stopPropagation();");

    //tabla de firewall

    $firewallTable.classList.add("firewall-table");
    $firewallTable.innerHTML = `
            <table>
                <tr>
                    <th>Id</th>
                    <th>Chain</th>
                    <th>Protocol</th>
                    <th>Origin IP</th>
                    <th>Destination IP</th>
                    <th>Port</th>
                    <th>Action</th>
                </tr>
            </table>
    `;

    //opciones avanzadas

    $advancedOptions.classList.add("advanced-options-modal");
    $advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="showDnsTable(event)">Ver Caché DNS</button>
        <button onclick="scanNetwork(event)" style="display: none;">Escanear Redes Disponibles</button>
        <button onclick="openBrowser(event)">Navegador</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    //eventos

    $networkObject.setAttribute("onclick", "showPcForm('" + $networkObject.id + "')");
    $networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    $networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");

    //construimos el objeto

    $networkObject.appendChild($icon);
    $networkObject.appendChild($arpTable);
    $networkObject.appendChild($dnsTable);
    $networkObject.appendChild($firewallTable);
    $networkObject.appendChild($advancedOptions);
    $board.appendChild($networkObject);
    itemIndex++;

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
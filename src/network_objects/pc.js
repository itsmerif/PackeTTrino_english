function createPcObject(x, y) {

    const $board = document.querySelector(".board");
    let $networkObject = document.createElement("article");
    let $icon = document.createElement("img");
    let $arpTable = document.createElement("article");
    let $dnsTable = document.createElement("article");
    let $firewallTable = document.createElement("article");
    let $advancedOptions = document.createElement("div");

    //comprobamos si el objeto queda clipeado fuera del tablero, y lo ajustamos

    [x,y] = checkObjectClip(x, y);

    //caracteristicas generales

    $networkObject.id = `pc-${itemIndex}`;
    $networkObject.style.left = `${x}px`;
    $networkObject.style.top = `${y}px`;
    $networkObject.classList.add("item-dropped", "pc");
    $networkObject.setAttribute("data-ip", "");
    $networkObject.setAttribute("data-netmask", "");
    $networkObject.setAttribute("data-mac", getRandomMac());
    $networkObject.setAttribute("data-gateway", "");
    $networkObject.setAttribute("data-switch", "");
    $networkObject.setAttribute("data-dhcp", false);
    $networkObject.setAttribute("data-dhcp-server", "");
    $networkObject.setAttribute("data-dns-server", "");
    $networkObject.setAttribute("data-etc-hosts", `{ "127.0.0.1": ["localhost"] }`);
    $networkObject.setAttribute("firewall-default-policy", "ACCEPT");
    $networkObject.setAttribute("web-server", "off");
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
        <button onclick="scanNetwork(event)">Escanear Redes Disponibles</button>
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

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(id);
        return;
    }

    const $networkObject = document.getElementById(id);
    const $textInputs = document.querySelector(".pc-form").querySelectorAll("input[type='text']");
    const $buttons = document.querySelectorAll(".pc-form button");

    //obtenemos los atributos del pc

    const ip = $networkObject.getAttribute("data-ip");
    const netmask = $networkObject.getAttribute("data-netmask");
    const gateway = $networkObject.getAttribute("data-gateway");
    const dnsServer = $networkObject.getAttribute("data-dns-server");
    const isDhcpOn = $networkObject.getAttribute("data-dhcp");
    const isWebServerOn = $networkObject.getAttribute("web-server");

    //mostramos el formulario con los datos

    document.querySelector(".pc-form #ip").value = ip;
    document.getElementById("form-item-id").innerHTML = id;
    document.querySelector(".pc-form #netmask").value = netmask;
    document.querySelector(".pc-form #gateway").value = gateway;
    document.querySelector(".pc-form #dns-server").value = dnsServer;

    //comprobamos si el equipo esta en modo DHCP

    if (isDhcpOn === "true") {
        document.querySelector(".pc-form #dhcp").checked = true;
        $textInputs.forEach(input => input.disabled = true);
        if (!ip)  $buttons.forEach(button => (button.id === "get-btn") ? button.style.display = "block" : button.style.display = "none");
        else $buttons.forEach(button => (button.id === "renew-btn" || button.id === "release-btn") ? button.style.display = "block" : button.style.display = "none");
    } else {
        document.querySelector(".pc-form #dhcp").checked = false;
        $textInputs.forEach(input => input.disabled = false);
        $buttons.forEach(button => (button.id === "save-btn") ? button.style.display = "block" : button.style.display = "none");
    }

    if (isWebServerOn === "on") document.querySelector(".pc-form #web-server").checked = true; //comprobamos si el servidor web esta encendido
    document.querySelector(".pc-form").style.display = "flex";
}

async function savePcSpecs(event) {

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
            $networkObject.setAttribute("data-ip", newIp);
            $networkObject.setAttribute("data-netmask", newNetmask);
            $networkObject.setAttribute("data-gateway", newGateway);
            $networkObject.setAttribute("data-dns-server", newDnsServer);
        },
        
        "get-btn": async () => { 
            await dhcp($networkObject.id, ["dhcp", "-renew"]); 
        },

        "renew-btn": async () => { 
            await dhcp($networkObject.id, ["dhcp", "-renew"]); 
        },

        "release-btn": async () => { 
            await dhcp($networkObject.id, ["dhcp", "-release"]);
        }
    }

    $networkObject.setAttribute("data-dhcp", isDhcpOn);
    $networkObject.setAttribute("web-server", isWebServerOn);
    $networkObjectIcon.src = (isWebServerOn) ? "./assets/board/www-server.svg" : "./assets/board/pc.svg"; //cambiamos el icono del objeto a servidor web
    document.querySelector(".pc-form").style.display = "none"; //cerramos el formulario
    (event.submitter.id in buttonFunctions) ? buttonFunctions[event.submitter.id]() : buttonFunctions["save-btn"] //ejecutamos la función correspondiente
}

function dhcpHandler(event) {

    const $dhcpToggle = event.target;
    const $buttons = document.querySelectorAll(".pc-form button");
    const $textInputs = document.querySelector(".pc-form").querySelectorAll("input[type='text']");
    const hasIp = document.querySelector(".pc-form #ip").value !== "";

    if ($dhcpToggle.checked) {
        $textInputs.forEach(input => input.disabled = true);
        if (hasIp)  $buttons.forEach(button => (button.id === "renew-btn" || button.id === "release-btn") ? button.style.display = "block" : button.style.display = "none");
        else $buttons.forEach(button => (button.id === "get-btn") ? button.style.display = "block" : button.style.display = "none");
    } else {
        $textInputs.forEach(input => input.disabled = false);
        $buttons.forEach(button => (button.id !== "save-btn") ? button.style.display = "none" : button.style.display = "block");
    }

}
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
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = true);
        document.querySelector(".pc-form").querySelector("button").innerHTML = "Renovar";
    } else {
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = false);
        document.querySelector(".pc-form #dhcp").checked = false;
        document.querySelector(".pc-form").querySelector("button").innerHTML = "Guardar";
    }

    //comprobamos si el servidor web esta encendido

    if (isWebServerOn === "on") {
        document.querySelector(".pc-form #web-server").checked = true;
    }
    
    //mostramos el formulario

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

    function staticIp() {
        $networkObject.setAttribute("data-ip", newIp);
        $networkObject.setAttribute("data-netmask", newNetmask);
        $networkObject.setAttribute("data-gateway", newGateway);
        $networkObject.setAttribute("data-dhcp", isDhcpOn);
        $networkObject.setAttribute("web-server", isWebServerOn);
        $networkObject.setAttribute("data-dns-server", newDnsServer);
    }

    document.querySelector(".pc-form").style.display = "none"; //cerramos el formulario

    if (event.submitter.id === "save-get-renew-btn") {

        $networkObjectIcon.src = (isWebServerOn) ? "./assets/board/www-server.svg" : "./assets/board/pc.svg"; //cambiamos el icono del objeto a servidor web
        if (isDhcpOn) await dhcp($networkObject.id, ["dhcp", "-renew"]); //obtenemos o renovamos la ip si esta en modo dhcp
        else staticIp(); //si no esta en modo dhcp, solo actualizamos los atributos del objeto

    } else {

        await dhcp($networkObject.id, ["dhcp", "-release"]); //liberamos la ip  

    }
}

function dhcpHandler(event) {

    const input = event.target;
    
    if (input.checked) dhcpRenewView();
    else removeDhcpView();

    function dhcpRenewView() {

        let hasIp = document.querySelector(".pc-form").querySelector("#ip").value !== "";

        let options = {
            true: () => { 
                document.querySelector(".pc-form").querySelector("button").innerHTML = "Renovar IP";
                document.querySelector(".pc-form").querySelector("#release-btn").style.display = "block"; 
            },
            false: () => document.querySelector(".pc-form").querySelector("button").innerHTML = "Obtener IP"
        }

        options[hasIp]();
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = true);
    }

    function removeDhcpView(){
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = false);
        document.querySelector(".pc-form").querySelector("button").innerHTML = "Guardar";
    }
}
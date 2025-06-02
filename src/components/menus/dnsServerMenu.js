function dns_server_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("dns-form", "modal", "draggable-modal");

    $menu.innerHTML = `

        <div class="window-frame"> <p id="form-dns-item-id"> </p> </div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Básico</button>
            <button class="btn-modern-blue dark" id="btn-records" data-tab="records-section">Registros</button>
        </div>

        <section id="basic-section">
            
            <section id="network-section" class="hidden">

                <div class="form-item">
                    <label for="ip">Dirección IP (IPv4):</label>
                    <input type="text" id="ip-dns" name="ip-dns" 
                    pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                    placeholder="192.168.1.1">
                </div>

                <div class="form-item">
                    <label for="netmask">Máscara de Red:</label>
                    <input type="text" id="netmask-dns" name="netmask-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                    placeholder="255.255.255.0">
                </div>

                <div class="form-item">
                    <label for="gateway">Puerta de Enlace:</label>
                    <input type="text" id="gateway-dns" name="gateway-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                    placeholder="192.168.1.1">
                </div>

            </section>

            <section id ="dns-server-section">

                <div class="form-item">
                    <label for="dns-recursive">Servidor DNS Recursivo:</label>
                    <input class="btn-toggle" type="checkbox" id="dns-recursive" name="dns-recursive">
                </div>

                <div class="form-item">
                    <label for="dns-cache">Servidor DNS Caché:</label>
                    <input class="btn-toggle" type="checkbox" id="dns-cache" name="dns-cache">
                </div>

            </section>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" type="submit">Guardar</button>
                <button class="btn-modern-red dark" id="close-btn">Cerrar</button>
            </div>

        </section>

        <section id="records-section" class="hidden">

            <div class="form-item">
                <label for="domain">Dominio:</label>
                <input type="text" id="domain" name="domain">
            </div>

            <div class="form-item">
                <label for="type">Tipo de Registro:</label>
                <select id="type" name="type">
                    <option value="A">A</option>
                    <option value="CNAME">CNAME</option>
                    <option value="NS">NS</option>
                    <option value="SOA">SOA</option>
                </select>
            </div>

            <div class="form-item">
                <label for="value">Valor:</label>
                <input type="text" id="value" name="value">
            </div>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" id="btn-add-record" style="padding: 5px;">Añadir Registro</button>
                <button class="btn-modern-red dark" id="btn-del-record" style="padding: 5px;">Eliminar Registro</button>
            </div>
            
            <div class="table-wrapper">
                <table id="records-table" class="inner-table"></table>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", saveDnsServerMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeDnsMenu);
    $menu.querySelector(".nav-panel").querySelectorAll("button").forEach(button => button.addEventListener("click", showDnsGraphicTab));
    $menu.querySelector("#btn-add-record").addEventListener("click", addDnsRecordHandler);
    $menu.querySelector("#btn-del-record").addEventListener("click", removeDnsRecordHandler);
    
    return $menu;

}

/**ESTA FUNCION CREA MUESTRA EL MENU DE CONFIGURACION DE UN SERVIDOR DNS, RELLENANDO LOS CAMPOS CORRESPONDIENTES*/
function showDnsServerMenu(event) {

    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    const $serverObject = event.target.closest(".item-dropped");
    const availableInterfaces = getInterfaces($serverObject.id);
    const networkObjectInterface = availableInterfaces[0];

    if (quickPingToggle) { //<-- comprobamos si estamos en modo icmptryout
        quickPing($serverObject.id);
        return;
    }

    const $menu = document.querySelector(".dns-form");
    const isDnsServer = $serverObject.id.startsWith("dns-server-");
    const isRecursive = $serverObject.getAttribute("recursion");
    const isCache = $serverObject.getAttribute("resolved");
    
    //<-- seccion basica de red (solo para servidores dns nativos)
    if (isDnsServer) {
        $menu.querySelector("#ip-dns").value = $serverObject.getAttribute(`ip-${networkObjectInterface}`);
        $menu.querySelector("#netmask-dns").value = $serverObject.getAttribute(`netmask-${networkObjectInterface}`);
        $menu.querySelector("#gateway-dns").value = $serverObject.getAttribute("data-gateway");
        $menu.querySelector("#network-section").classList.remove("hidden");
    }

    //<-- seccion de dns
    $menu.querySelector("#dns-recursive").checked = isRecursive === "true";
    $menu.querySelector("#dns-cache").checked = isCache === "true";

    //<-- seccion de registros
    $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;

    document.getElementById("form-dns-item-id").innerHTML = $serverObject.id;
    $menu.style.display = "flex";
}

/**ESTA FUNCION ACTUALIZA LA INFORMACION DE UN SERVIDOR DNS*/
function saveDnsServerMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = document.querySelector(".dns-form");
    const $serverObject = document.getElementById($menu.querySelector("#form-dns-item-id").innerHTML);
    const availableInterfaces = getInterfaces($serverObject.id);
    const networkObjectInterface = availableInterfaces[0];
    const isRecursive = $menu.querySelector("#dns-recursive").checked;
    const isCache = $menu.querySelector("#dns-cache").checked;

    if ($serverObject.id.startsWith("dns-server")) { //<-- solo para servidores dns nativos

        const ip = $menu.querySelector("#ip-dns").value;
        const netmask = $menu.querySelector("#netmask-dns").value;
        const gateway = $menu.querySelector("#gateway-dns").value;

        if (ip !== "" && !isValidIp(ip)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>La IP "${ip}" no es válida.`));
            return;
        }

        if (netmask !== "" && !isValidIp(netmask)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>La máscara de red "${netmask}" no es válida.`));
            return;
        }

        if (gateway !== "" && !isValidIp(gateway)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>El puerta de enlace "${gateway}" no es válida.`));
            return;
        }

        configureInterface($serverObject.id, ip, netmask, networkObjectInterface);
        setDirectRoutingRule($serverObject.id, ip, netmask, networkObjectInterface);
        $serverObject.setAttribute("data-gateway", gateway);
        setRemoteRoutingRule($serverObject.id, "0.0.0.0", "0.0.0.0", ip, networkObjectInterface, gateway);
    }

    $serverObject.setAttribute("recursion", isRecursive);
    $serverObject.setAttribute("resolved", isCache);

    bodyComponent.render(popupMessage(`Los cambios se han guardado correctamente.`));

}

/**ESTA FUNCION CIERRA EL MENU DE CONFIGURACION DE UN SERVIDOR DNS*/
function closeDnsMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    $menu.querySelector("#network-section").classList.add("hidden");
    $menu.reset();
    $menu.style.display = "none";
}

/**ESTA FUNCION MUESTRA LA SECCION DE REGISTROS DE UN SERVIDOR DNS*/
function showDnsGraphicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const $targetButton = event.target;
    const $sections = $menu.querySelectorAll(":scope > section");
    const $navButtons = $menu.querySelector(".nav-panel").querySelectorAll("button");
    const $targetSection = $menu.querySelector(`#${$targetButton.getAttribute("data-tab")}`);
    $navButtons.forEach($button => $button.classList.remove("active"));
    $targetButton.classList.add("active");
    $sections.forEach($section => $section.classList.add("hidden"));
    $targetSection.classList.remove("hidden");
}

/**ESTA FUNCION GESTIONA EL AÑADIR UN REGISTRO*/
function addDnsRecordHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".dns-form");
    const serverObjectId = document.getElementById("form-dns-item-id").innerHTML;
    const $serverObject = document.getElementById(serverObjectId);
    
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    const value = $menu.querySelector("#value").value;

    const dnsRecordTypes = { //<-- mapeo de los tipos de registros a las funciones de validacion
        "SOA": () => isValidSOARecord(serverObjectId, domain, value),
        "NS": () => isValidNSRecord(serverObjectId, domain, value),
        "A": () => isValidARecord(serverObjectId, domain, value),
        "CNAME": () => isValidCNAMERecord(serverObjectId, domain, value)
    }

    try {

        dnsRecordTypes[recordType.toUpperCase()](); //<-- validamos el registro
        let record = new dnsRecord(domain, recordType, value);
        addDnsEntry(serverObjectId, record);
        $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));

    }

}

/**ESTA FUNCION GESTIONA EL ELIMINAR UN REGISTRO*/
function removeDnsRecordHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const serverObjectId = document.getElementById("form-dns-item-id").innerHTML;
    const $serverObject = document.getElementById(serverObjectId);
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    delDnsEntry(serverObjectId, recordType, domain);
    $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;
}
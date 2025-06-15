function dns_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dns-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Básico</button>
            <button class="btn-modern-blue dark" id="btn-records" data-tab="records-section">Registros</button>
        </div>

        <section id="basic-section">
            
            <section id="network-section" class="hidden">

                <div class="form-item">
                    <label for="iface">Interfaz:</label>
                    <select id="iface" name="iface"></select>
                </div>

                <div class="form-item">
                    <label for="ip">Dirección IP (IPv4):</label>
                    <input type="text" id="ip" name="ip">
                </div>

                <div class="form-item">
                    <label for="netmask">Máscara de Red:</label>
                    <input type="text" id="netmask" name="netmask">
                </div>

                <div class="form-item">
                    <label for="gateway">Puerta de Enlace:</label>
                    <input type="text" id="gateway" name="gateway">
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

            <div class="soa-record-wrapper hidden">

                <div class="form-item">
                    <label for="serial">Número de Serie:</label>
                    <input type="text" id="serial" name="serial">
                </div> 

                <div class="form-item">
                    <label for="cache-ttl">TTL de Caché:</label>
                    <input type="text" id="cache-ttl" name="cache-ttl">
                </div>

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
    $menu.querySelector("#type").addEventListener("change", recordTypeHandler);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "dns-form"));
    
    return $menu;

}

function showDnsServerMenu(event) {

    event.stopPropagation();
    
    const $networkObject = event.target.closest(".item-dropped");

    if (quickPingToggle) { //<-- comprobamos si estamos en modo icmptryout
        quickPing($networkObject.id);
        return;
    }

    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const $menu = document.querySelector(".dns-form");
    $menu.dataset.id = $networkObject.id;
    const isDnsServer = $networkObject.id.startsWith("dns-server-");
    const isRecursive = $networkObject.getAttribute("recursion");
    const isCache = $networkObject.getAttribute("resolved");
    
    //cargamos las interfaces disponibles

    loadInterfaces("dns-form");
    
    //atributos del equipo
    if (isDnsServer) {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
        $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
        $menu.querySelector("#network-section").classList.remove("hidden");
    }

    //atributos del servicio
    $menu.querySelector("#dns-recursive").checked = isRecursive === "true";
    $menu.querySelector("#dns-cache").checked = isCache === "true";
    $menu.querySelector("#records-table").innerHTML = $networkObject.querySelector(".dns-table").querySelector("table").innerHTML;
    $menu.querySelector(".frame-title").innerHTML = $networkObject.id;

    //mostramos el menú
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";
}

function saveDnsServerMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = document.querySelector(".dns-form");
    const $serverObject = document.getElementById($menu.dataset.id);
    const networkObjectInterface = $menu.querySelector("#iface").value;
    const ip = $menu.querySelector("#ip").value;
    const netmask = $menu.querySelector("#netmask").value;
    const gateway = $menu.querySelector("#gateway").value;
    const isDnsServer = $serverObject.id.startsWith("dns-server");
    const isRecursive = $menu.querySelector("#dns-recursive").checked;
    const isCache = $menu.querySelector("#dns-cache").checked;
    const isEmptyForm = ip === "" && netmask === "";

    try {

        if (isDnsServer) {

            if (!isEmptyForm) {
                if (!isValidIp(ip)) throw new Error(`Error: La IP "${ip}" no es válida.`);
                if (!isValidIp(netmask)) throw new Error(`Error: La máscara de red "${netmask}" no es válida.`);
            }

            if (gateway !== "" && !isValidIp(gateway)) throw new Error(`Error: La puerta de enlace "${gateway}" no es válida.`);

            configureInterface($serverObject.id, ip, netmask, networkObjectInterface);
            setDefaultGateway($serverObject.id, gateway);

        }

        $serverObject.setAttribute("recursion", isRecursive);
        $serverObject.setAttribute("resolved", isCache);

        bodyComponent.render(popupMessage(`Los cambios se han guardado correctamente.`));

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));
        return;

    }

}

function closeDnsMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    $menu.querySelector("#network-section").classList.add("hidden");
    $menu.querySelector(".soa-record-wrapper").classList.add("hidden");
    $menu.reset();
    $menu.style.display = "none";
}

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

function addDnsRecordHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".dns-form");
    const serverObjectId = $menu.dataset.id;
    const $serverObject = document.getElementById(serverObjectId);   
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    const value = $menu.querySelector("#value").value;
    const serial = $menu.querySelector("#serial").value;
    const cacheTTL = $menu.querySelector("#cache-ttl").value;

    const dnsRecordTypes = { //<-- mapeo de los tipos de registros a las funciones de validacion
        "SOA": () => isValidSOARecord(serverObjectId, domain, value, serial, cacheTTL),
        "NS": () => isValidNSRecord(serverObjectId, domain, value),
        "A": () => isValidARecord(serverObjectId, domain, value),
        "CNAME": () => isValidCNAMERecord(serverObjectId, domain, value)
    }

    try {

        dnsRecordTypes[recordType.toUpperCase()](); //<-- validamos el registro
        
        let record = new dnsRecord(domain, recordType, value);

        if (recordType === "SOA") {
            record.serial = serial; 
            record.cacheTTL = cacheTTL;
        }

        addDnsEntry(serverObjectId, record);

        $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));

    }

}

function removeDnsRecordHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const serverObjectId = $menu.dataset.id;
    const $serverObject = document.getElementById(serverObjectId);
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    delDnsEntry(serverObjectId, recordType, domain);
    $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;
}

function recordTypeHandler(event) {
    const $menu = document.querySelector(".dns-form");
    const $recordType = $menu.querySelector("#type");
    const $serial = $menu.querySelector("#serial");
    const $soaRecordWrapper = $menu.querySelector(".soa-record-wrapper");
    $serial.value = (new Date()).getTime(); //generamos un numero de serie 
    if ($recordType.value === "SOA") $soaRecordWrapper.classList.remove("hidden");
    else $soaRecordWrapper.classList.add("hidden");
}
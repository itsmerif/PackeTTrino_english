function router_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("router-form", "modal");

    $menu.innerHTML = `

        <p id="form-router-item-id"></p>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Básico</button>
            <button class="btn-modern-blue dark" id="btn-routing-rules" data-tab="routing-rules-section">Reglas de Enrutamiento</button>
        </div>

        <section id="basic-section">

            <div class="interfaces-wrapper">
                <select class="interfaces-container"></select>
                <button class="btn-modern-red" id="del-iface">Eliminar</button>
                <button class="btn-modern-blue dark" id="add-iface">Añadir</button>
            </div>

            <div class="form-item">
                <label for="router-ip">Dirección IP (ipv4):</label>
                <input type="text" id="router-ip" name="router-ip">
            </div>

            <div class="form-item"> 
                <label for="router-netmask">Máscara de Red:</label>
                <input type="text" name="router-netmask" id="router-netmask">
            </div>
            
            <button class="btn-modern-blue dark" style="padding: 10px;">Guardar</button>

        </section>

        <section id="routing-rules-section" class="hidden">

            <div class="form-item">
                <label for="destination-ip">IP de Destino (Ipv4/CIDR):</label>
                <input type="text" id="destination-ip" name="destination-ip" placeholder="192.168.0.0/24">
            </div>

            <div class="form-item">
                <label for="gateway-interface">Interfaz de Salida:</label>
                <input type="text" id="gateway-interface" name="gateway-interface" placeholder="enp0s3">
            </div>

            <div class="form-item">
                <label for="nexthop">Siguiente Salto:</label>
                <input type="text" id="nexthop" name="nexthop" placeholder="0.0.0.0">
            </div>

            <div class="form-item">
                <button class="btn-modern-blue dark" style="padding: 10px;" id="btn-add-rule">Añadir Regla</button>
                <button class="btn-modern-red dark" style="padding: 10px;" id="btn-del-rule">Eliminar Regla</button>
            </div>

            <table id="routing-rules-table"></table>

        </section>

    `;

    $menu.addEventListener("submit", checkandCloseRouterSpecs);
    $menu.querySelector(".interfaces-container").addEventListener("change", selectInterface);
    $menu.querySelectorAll("input").forEach(input => input.addEventListener("change", registerNetworkChanges));
    $menu.querySelector("#del-iface").addEventListener("click", deleteInterface);
    $menu.querySelector("#add-iface").addEventListener("click", addInterface);
    $menu.querySelector(".nav-panel").querySelectorAll("button").forEach(button => button.addEventListener("click", showTab));
    $menu.querySelector("#btn-add-rule").addEventListener("click", addRoutingRuleGraphicHandler);
    $menu.querySelector("#btn-del-rule").addEventListener("click", removeRoutingRuleGraphicHandler);

    return $menu;

}

function showRouterSpecs(event) {

    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none"; //<-- ocultamos el modal de opciones avanzadas

    const $networkObject = event.target.closest(".item-dropped");
    const $menu = document.querySelector(".router-form");
    const $interfacesContainer = $menu.querySelector(".interfaces-container");

    if (icmpTryoutToggle) { //<-- si estamos en modo de simulacion de ping visual
        icmpTryoutProcess($networkObject.id);
        return;
    }
    
    if (document.querySelector(".router-form").style.display === "flex") return; //<-- si el formulario ya esta abierto, no se hace nada

    //<--- seccion basica de red

    let index = 3;
    let ip = $networkObject.getAttribute("ip-enp0s" + index);
    let netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    while ( ip !== null && netmask !== null ) {

        $interfacesContainer.innerHTML += `<option value="enp0s${index}">enp0s${index}</option>`;

        routerChangesBuffer["enp0s" + index] = {
            ip: ip,
            netmask: netmask
        }

        if (index === 3) {

            $menu.querySelector("#router-ip").value = ip;
            $menu.querySelector("#router-netmask").value = netmask;
            index = 8;

        } else index++;

        ip = $networkObject.getAttribute("ip-enp0s" + index);
        netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    }

    //<--- seccion de reglas de enrutamiento

    $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;

    document.getElementById("form-router-item-id").innerHTML = $networkObject.id; // <-- se guarda el id del equipo en el formulario
    $menu.style.display = "flex";
}

function checkandCloseRouterSpecs(event) {

    event.preventDefault();

    const $form = document.querySelector(".router-form");
    const $networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);

    for (let interface in routerChangesBuffer){

        let ip = routerChangesBuffer[interface].ip;
        let netmask = routerChangesBuffer[interface].netmask;

        if (!isValidIp(ip) && ip !== "") {
            bodyComponent.render(popupMessage(`<span>Error: </span>La IP "${ip}" no es válida.`));
            return;
        }

        if (!isValidIp(netmask) && netmask !== "") {
            bodyComponent.render(popupMessage(`<span>Error: </span>La máscara de red "${netmask}" no es válida.`));
            return;
        }

        if (ip === "") {
            deconfigureInterface($networkObject.id, interface);
            removeDirectRoutingRule($networkObject.id, interface);
        } else {
            configureInterface($networkObject.id, ip, netmask, interface);
            setDirectRoutingRule($networkObject.id, ip, netmask, interface);
        }

    }

    $form.querySelector(".interfaces-container").innerHTML = "";
    routerChangesBuffer = {};
    $form.style.display = "none";

}

function selectInterface(event)  {
    const $select = event.target;
    const $networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);
    const $form = document.querySelector(".router-form");
    let ip = $networkObject.getAttribute("ip-" + $select.value);
    let netmask = $networkObject.getAttribute("netmask-" + $select.value);
    $form.querySelector("#router-ip").value = ip;
    $form.querySelector("#router-netmask").value = netmask;
}

function registerNetworkChanges()  {
    const $form = document.querySelector(".router-form");
    let ip = $form.querySelector("#router-ip").value;
    let netmask = $form.querySelector("#router-netmask").value;
    routerChangesBuffer[$form.querySelector(".interfaces-container").value] = {
        ip: ip,
        netmask: netmask
    }
}

function addInterface(event) {

    event.preventDefault();

    const $networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);
    const $interfacesContainer = document.querySelector(".router-form").querySelector(".interfaces-container");

    let index = 10;
    let ip = $networkObject.getAttribute("ip-enp0s" + index);
    let netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    while ( ip !== null && netmask !== null ) {
        index++;
        ip = $networkObject.getAttribute("ip-enp0s" + index);
        netmask = $networkObject.getAttribute("netmask-enp0s" + index);
    }

    $networkObject.setAttribute("ip-enp0s" + index, "");
    $networkObject.setAttribute("netmask-enp0s" + index, "");
    $networkObject.setAttribute("mac-enp0s" + index, getRandomMac());
    $networkObject.setAttribute("data-switch-enp0s" + index, "");
    $networkObject.querySelector("img").draggable = true;
    $interfacesContainer.innerHTML += `<option value="enp0s${index}">enp0s${index}</option>`;
    
    routerChangesBuffer["enp0s" + index] = {
        ip: "",
        netmask: ""
    }

    bodyComponent.render(popupMessage(`Interfaz enp0s${index} agregada con éxito.`));
  
}

function deleteInterface(event) {

    event.preventDefault();

    const $routerForm = document.querySelector(".router-form");
    const $networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);
    const currentInterface = $routerForm.querySelector(".interfaces-container").value;
    const fixedInterfaces = ["enp0s3", "enp0s8", "enp0s9"];

    if (fixedInterfaces.includes(currentInterface)) {
        bodyComponent.render(popupMessage(`<span>Error: </span>La interfaz ${currentInterface} no se puede eliminar.`));
        return;
    }

    if ($networkObject.getAttribute("data-switch-" + currentInterface) !== "") {
        bodyComponent.render(popupMessage(`<span>Error: </span>La interfaz ${currentInterface} tiene una conexión activa.`));
        return;
    }

    $networkObject.removeAttribute("ip-" + currentInterface);
    $networkObject.removeAttribute("netmask-" + currentInterface);
    $networkObject.removeAttribute("mac-" + currentInterface);
    $networkObject.removeAttribute("data-switch-" + currentInterface);
    
    removeDirectRoutingRule($networkObject.id, currentInterface);

    $routerForm.querySelector(".interfaces-container").querySelectorAll("option").forEach($option => {
        if ($option.value === currentInterface) $option.remove();
    });

    delete routerChangesBuffer[currentInterface];

    bodyComponent.render(popupMessage(`Interfaz ${currentInterface} eliminada con éxito.`));
}

function showTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".router-form");
    const $targetButton = event.target;
    const $sections = $menu.querySelectorAll("section");
    const $navButtons = $menu.querySelector(".nav-panel").querySelectorAll("button");
    const $targetSection = $menu.querySelector(`#${$targetButton.getAttribute("data-tab")}`);
    $navButtons.forEach($button => $button.classList.remove("active"));
    $targetButton.classList.add("active");
    $sections.forEach($section => $section.classList.add("hidden"));
    $targetSection.classList.remove("hidden");
}

function addRoutingRuleGraphicHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const networkObjectId = document.querySelector(".router-form #form-router-item-id").innerHTML;
    const $networkObject = document.getElementById(networkObjectId);
    const $routingSection = $menu.querySelector("#routing-rules-section");

    //<-- obtengo los parametros de la regla
    
    const destination = $routingSection.querySelector("#destination-ip").value;
    const gatewayInterface = $routingSection.querySelector("#gateway-interface").value;
    const nexthop = $routingSection.querySelector("#nexthop").value;

    //<-- intento añadir la regla

    try {
        addRoutingRuleGraphic(networkObjectId, destination, gatewayInterface, nexthop);
        $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

function removeRoutingRuleGraphicHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const networkObjectId = document.querySelector(".router-form #form-router-item-id").innerHTML;
    const $networkObject = document.getElementById(networkObjectId);
    const $routingSection = $menu.querySelector("#routing-rules-section");

    //<-- obtengo los parametros de la regla
    
    const destination = $routingSection.querySelector("#destination-ip").value;

    //<-- intento eliminar la regla

    try {
        removeRoutingRuleGraphic(networkObjectId, destination);
        $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

function addRoutingRuleGraphic(networkObjectId, destination, gatewayInterface, nexthop) {

    //<-- validamos la ip de destino

    if (!isValidCidrIp(destination)) throw new Error(`Error: se esperaba un prefijo válido en vez de "${destination}".`);
    const [destinationIP, destinationNetmask] = parseCidr(destination);
    if (getNetwork(destinationIP, destinationNetmask) !== destinationIP) throw new Error(`Error: la ip de destino "${destination}" NO es una red.`);
    
    //<-- validamos la interfaz de salida
    
    if (!(getInterfaces(networkObjectId)).includes(gatewayInterface)) throw new Error(`Error: no se reconoce la interfaz "${gatewayInterface}".`);
    const [gatewayIp, gatewayNetmask, interfaceMac] = getInfoFromInterface(networkObjectId, gatewayInterface);
    if (!gatewayIp) throw new Error(`Error: la interfaz "${gatewayInterface}" no está configurada.`);

    //<-- validamos el siguiente salto

    if (!isValidIp(nexthop)) throw new Error(`Error: se esperaba una ip válida en vez de "${nexthop}" en el siguiente salto.`);
    if (getNetwork(gatewayIp, gatewayNetmask) !== getNetwork(nexthop, gatewayNetmask)) throw new Error(`Error: el siguiente salto "${nexthop}" es inaccesible.`);
    if (nexthop === "0.0.0.0") throw new Error(`Error: el siguiente salto "${nexthop}" no es válido para una regla remota.`);

    setRemoteRoutingRule(networkObjectId,
        destinationIP, //red de destino
        destinationNetmask, //mascara de red
        gatewayIp, //ip de salida
        gatewayInterface, //interfaz
        nexthop //ip del siguiente salto
    );

}


function removeRoutingRuleGraphic(networkObjectId, destination) {

    //<-- validamos la ip de destino

    if (!isValidCidrIp(destination)) throw new Error(`Error: se esperaba un prefijo válido en vez de "${destination}".`);
    const [destinationIP, destinationNetmask] = parseCidr(destination);
    if (getNetwork(destinationIP, destinationNetmask) !== destinationIP) throw new Error(`Error: la ip de destino "${destination}" NO es una red.`);

    removeRemoteRoutingRule(networkObjectId,
        destinationIP, //red de destino
        destinationNetmask //mascara de red
    );

}
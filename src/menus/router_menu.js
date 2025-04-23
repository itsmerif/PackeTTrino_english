function router_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("router-form", "modal");

    $menu.innerHTML = `
        <p id="form-router-item-id"></p>
        <div class="interfaces-wrapper">
            <select class="interfaces-container"></select>
            <button class="btn-modern-red" id="del-iface">Eliminar</button>
            <button class="btn-modern-blue dark" id="add-iface">Añadir</button>
        </div>
        <label for="router-ip">Dirección IP (ipv4):</label>
        <input type="text" id="router-ip" name="router-ip">
        <label for="router-netmask">Máscara de Red:</label>
        <input type="text" name="router-netmask" id="router-netmask">
        <button class="btn-modern-blue dark" style="padding: 10px;">Guardar</button>
    `;

    $menu.addEventListener("submit", checkandCloseRouterSpecs);
    $menu.querySelector(".interfaces-container").addEventListener("change", selectInterface);
    $menu.querySelectorAll("input").forEach(input => input.addEventListener("change", registerNetworkChanges));
    $menu.querySelector("#del-iface").addEventListener("click", deleteInterface);
    $menu.querySelector("#add-iface").addEventListener("click", addInterface);

    return $menu;

}

function showRouterSpecs(event) {

    event.stopPropagation();

    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    if (document.querySelector(".router-form").style.display === "flex") return;

    const $networkObject = event.target.closest(".item-dropped");

    if (icmpTryoutToggle) {
        icmpTryoutProcess($networkObject.id);
        return;
    }

    const $form = document.querySelector(".router-form");
    const $interfacesContainer = $form.querySelector(".interfaces-container");
    let index = 3;
    let ip = $networkObject.getAttribute("ip-enp0s" + index);
    let netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    while ( ip !== null && netmask !== null ) {

        $interfacesContainer.innerHTML += `
            <option value="enp0s${index}">enp0s${index}</option>
        `;

        routerChangesBuffer["enp0s" + index] = {
            ip: ip,
            netmask: netmask
        }

        if (index === 3) {

            $form.querySelector("#router-ip").value = ip;
            $form.querySelector("#router-netmask").value = netmask;
            index = 8;

        } else index++;

        ip = $networkObject.getAttribute("ip-enp0s" + index);
        netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    }

    document.getElementById("form-router-item-id").innerHTML = $networkObject.id;
    $form.style.display = "flex";
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
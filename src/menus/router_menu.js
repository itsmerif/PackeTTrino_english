function router_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("router-form", "modal");

    $menu.innerHTML = `
        <p id="form-router-item-id"></p>
        <select class="interfaces-container"></select>
        <label for="router-ip">IP:</label>
        <input type="text" id="router-ip" name="router-ip" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="router-netmask">Máscara de Red:</label>
        <input type="text" name="router-netmask" id="router-netmask" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <button class="btn-modern-yellow" type="submit">Guardar</button>
    `;

    $menu.addEventListener("submit", saveRouterSpecs);
    $menu.querySelector(".interfaces-container").addEventListener("change", selectInterface);
    $menu.querySelectorAll("input").forEach(input => input.addEventListener("change", registerNetworkChanges));

    return $menu;

}

function showRouterSpecs(event) {

    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    if (icmpTryoutToggle) {
        icmpTryoutProcess(networkObject.id);
        return;
    }

    if (document.querySelector(".router-form").style.display === "flex") return;

    const networkObject = event.target.closest(".item-dropped");

    const $form = document.querySelector(".router-form");
    const $interfacesContainer = $form.querySelector(".interfaces-container");
    let index = 3;
    let ip = networkObject.getAttribute("ip-enp0s" + index);
    let netmask = networkObject.getAttribute("netmask-enp0s" + index);

    while ( ip !== null && netmask !== null ) {

        $interfacesContainer.innerHTML += `
            <option value="enp0s${index}">enp0s${index}</option>
        `;

        if (index === 3) {

            $form.querySelector("#router-ip").value = ip;
            $form.querySelector("#router-netmask").value = netmask;
            index = 8;

        } else index++;

        ip = networkObject.getAttribute("ip-enp0s" + index);
        netmask = networkObject.getAttribute("netmask-enp0s" + index);

    }

    document.getElementById("form-router-item-id").innerHTML = networkObject.id;
    $form.style.display = "flex";
}

function saveRouterSpecs(event) {

    event.preventDefault();

    const $form = document.querySelector(".router-form");
    const $networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);
    let index = 3;
    let ip = $networkObject.getAttribute("ip-enp0s" + index);
    let netmask = $networkObject.getAttribute("netmask-enp0s" + index);

    while ( ip !== null && netmask !== null ) {
        addRoutingEntry($networkObject.id, getNetwork(ip, netmask), netmask, ip, "enp0s" + index, "0.0.0.0");
        if (index === 3) index=8;
        else index++;
        ip = $networkObject.getAttribute("ip-enp0s" + index);
        netmask = $networkObject.getAttribute("netmask-enp0s" + index);
    }

    $form.querySelector(".interfaces-container").innerHTML = "";
    $form.style.display = "none";
    //bodyComponent.render(popupMessage(`La tabla de enrutamiento se ha actualizado correctamente.`));

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

function registerNetworkChanges(event)  {
    const $form = document.querySelector(".router-form");
    const $networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);
    let ip = $form.querySelector("#router-ip").value;
    let netmask = $form.querySelector("#router-netmask").value;
    $networkObject.setAttribute("ip-" + $form.querySelector(".interfaces-container").value, ip);
    $networkObject.setAttribute("netmask-" + $form.querySelector(".interfaces-container").value, netmask);
}
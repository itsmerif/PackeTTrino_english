function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal");

    $menu.innerHTML = `
        <p id="form-dhcp-relay-item-id"></p>
        <label for="ip-relay">IP:</label>
        <input type="text" id="ip-relay" name="ip-relay"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="netmask-relay">Netmask:</label>
        <input type="text" id="netmask-relay" name="netmask-relay"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="gateway-relay">Gateway:</label>
        <input type="text" id="gateway-relay" name="gateway-relay"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <label for="main-server">IP del Servidor DHCP Principal:</label>
        <input type="text" id="main-server" name="main-server"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <button class="btn-modern-blue" type="submit">Guardar</button>   
    `;

    $menu.addEventListener("submit", saveDhcpRelaySpecs);

    return $menu;

}

function showDhcpRelaySpecs(event) {

    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const itemId = networkObject.id; //obtenemos el id del elemento
    const $form = document.querySelector(".dhcp-relay-form");
    const isNotDhcpRelay = !itemId.startsWith("dhcp-relay-server-");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(networkObject.id);
        return;
    }

    //obtenemos los atributos del servidor

    const ip = networkObject.getAttribute("ip-enp0s3");
    const netmask = networkObject.getAttribute("netmask-enp0s3");
    const gateway = networkObject.getAttribute("data-gateway");
    const mainServer = networkObject.getAttribute("data-main-server");

    //mostramos el formulario

    $form.querySelector("#ip-relay").value = ip;
    $form.querySelector("#netmask-relay").value = netmask;
    $form.querySelector("#gateway-relay").value = gateway;
    $form.querySelector("#main-server").value = mainServer;
    document.getElementById("form-dhcp-relay-item-id").innerHTML = networkObject.id;

    //si no es un servidor dhcp, bloqueamos la red basica

    $form.querySelector("#ip-relay").disabled = isNotDhcpRelay;
    $form.querySelector("#netmask-relay").disabled = isNotDhcpRelay;
    $form.querySelector("#gateway-relay").disabled = isNotDhcpRelay;

    //ocultamos y mostramos

    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    $form.style.display = "flex";
}

function saveDhcpRelaySpecs(event) {
    event.preventDefault();
    //obtenemos los valores del formulario  
    const newIp = document.querySelector(".dhcp-relay-form #ip-relay").value;
    const newNetmask = document.querySelector(".dhcp-relay-form #netmask-relay").value;
    const newGateway = document.querySelector(".dhcp-relay-form #gateway-relay").value;
    const newMainServer = document.querySelector(".dhcp-relay-form #main-server").value;
    //guardamos los nuevos atributos en el server
    const networkObject = document.getElementById(document.getElementById("form-dhcp-relay-item-id").innerHTML);
    networkObject.setAttribute("ip-enp0s3", newIp);
    networkObject.setAttribute("netmask-enp0s3", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-main-server", newMainServer);
    //ocultamos el formulario
    document.querySelector(".dhcp-relay-form").style.display = "none";  
}
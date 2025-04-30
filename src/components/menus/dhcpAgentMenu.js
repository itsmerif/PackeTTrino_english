function dhcp_agent_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-relay-form", "modal");

    $menu.innerHTML = `
        <p id="form-dhcp-relay-item-id"></p>

        <section class="basic-section">
        
            <label for="ip-relay">Dirección IP (ipv4):</label>
            <input type="text" id="ip-relay" name="ip-relay" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

            <label for="netmask-relay">Máscara de Red:</label>
            <input type="text" id="netmask-relay" name="netmask-relay" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

            <label for="gateway-relay">Puerta de enlace:</label>
            <input type="text" id="gateway-relay" name="gateway-relay" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        
        </section>

        <section class="dhcp-relay-section">
            <label for="main-server">Servidor DHCP Principal:</label>
            <input type="text" id="main-server" name="main-server" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </section>

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
    const isDhcpRelay = itemId.startsWith("dhcp-relay-server-");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(networkObject.id);
        return;
    }

    $form.querySelector("#ip-relay").value = networkObject.getAttribute("ip-enp0s3");
    $form.querySelector("#netmask-relay").value = networkObject.getAttribute("netmask-enp0s3");
    $form.querySelector("#gateway-relay").value = networkObject.getAttribute("data-gateway");;
    $form.querySelector("#main-server").value = networkObject.getAttribute("data-main-server");;
    $form.querySelector("#form-dhcp-relay-item-id").innerHTML = networkObject.id;
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";

    if (!isDhcpRelay) $form.querySelector(".basic-section").classList.add("hidden");

    $form.style.display = "flex";
}

function saveDhcpRelaySpecs(event) {

    event.preventDefault();

    const $networkObject = document.getElementById(document.getElementById("form-dhcp-relay-item-id").innerHTML);
    const $form = document.querySelector(".dhcp-relay-form");
    const newIp = document.querySelector(".dhcp-relay-form #ip-relay").value;
    const newNetmask = document.querySelector(".dhcp-relay-form #netmask-relay").value;
    const newGateway = document.querySelector(".dhcp-relay-form #gateway-relay").value;
    const newMainServer = document.querySelector(".dhcp-relay-form #main-server").value;
    const isDhcpRelay = $networkObject.id.startsWith("dhcp-relay-server-");

    if (isDhcpRelay) {
        //guardamos los nuevos atributos en el server
        configureInterface($networkObject.id, newIp, newNetmask, "enp0s3");
        setDirectRoutingRule($networkObject.id, newIp, newNetmask, "enp0s3");
        $networkObject.setAttribute("data-gateway", newGateway);
        setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", newIp, "enp0s3", newGateway);
    }

    $networkObject.setAttribute("data-main-server", newMainServer);
    $form.querySelector(".basic-section").classList.remove("hidden");
    $form.style.display = "none";  
}
function dhcp_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-form", "modal");

    $menu.innerHTML = `
    
        <p id="form-dhcp-item-id"></p>

        <div>
        <label for="ip-dhcp">IP:</label>
        <input type="text" id="ip-dhcp" name="ip-dhcp"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="netmask-dhcp">Netmask:</label>
        <input type="text" id="netmask-dhcp" name="netmask-dhcp"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="gateway-dhcp">Gateway:</label>
        <input type="text" id="gateway-dhcp" name="gateway-dhcp"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <p> Opciones de Servicio </p>

        <div>
        <label for="range-start">Rango de IPs:</label>
        <input type="text" id="range-start" name="range-start"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" id="range-end" name="range-end"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-netmask">Oferta Netmask:</label>
        <input type="text" id="offer-netmask" name="offer-netmask"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-gateway">Oferta Gateway:</label>
        <input type="text" id="offer-gateway" name="offer-gateway"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-dns">Oferta Servidor DNS:</label>
        <input type="text" id="offer-dns" name="offer-dns"
            pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        </div>

        <div>
        <label for="offer-lease-time">Oferta Tiempo de Alquiler:</label>
        <input type="text" id="offer-lease-time" name="offer-lease-time" pattern="^[0-9]+$">
        </div>

        <button class="btn-modern-blue" type="submit">Guardar</button>

    `;

    $menu.addEventListener("submit", saveDhcpSpecs);
    return $menu;
    
}

function showDhcpSpecs(event) { 
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const itemId = networkObject.id; //obtenemos el id del elemento

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(itemId);
        return;
    }

    //obtenemos los atributos del servidor
    const ip = networkObject.getAttribute("ip-enp0s3");
    const netmask = networkObject.getAttribute("netmask-enp0s3");
    const gateway = networkObject.getAttribute("data-gateway");
    const rangeStart = networkObject.getAttribute("data-range-start");
    const rangeEnd = networkObject.getAttribute("data-range-end");
    const offerGateway = networkObject.getAttribute("offer-gateway");
    const offerNetmask = networkObject.getAttribute("offer-netmask");
    const offerDns = networkObject.getAttribute("offer-dns");
    const offerLeaseTime = networkObject.getAttribute("offer-lease-time");

    //mostramos el formulario
    document.querySelector(".dhcp-form #ip-dhcp").value = ip;
    document.querySelector(".dhcp-form #netmask-dhcp").value = netmask;
    document.querySelector(".dhcp-form #gateway-dhcp").value = gateway;
    document.querySelector(".dhcp-form #range-start").value = rangeStart;
    document.querySelector(".dhcp-form #range-end").value = rangeEnd;
    document.getElementById("form-dhcp-item-id").innerHTML = itemId;
    document.querySelector(".dhcp-form #offer-gateway").value = offerGateway;
    document.querySelector(".dhcp-form #offer-netmask").value = offerNetmask;
    document.querySelector(".dhcp-form #offer-dns").value = offerDns;
    document.querySelector(".dhcp-form #offer-lease-time").value = offerLeaseTime;

    //ocultamos y mostramos
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    document.querySelector(".dhcp-form").style.display = "flex";
}

function saveDhcpSpecs(event) {

    event.preventDefault();
    const networkObject = document.getElementById(document.getElementById("form-dhcp-item-id").innerHTML);

    //obtenemos los valores del formulario  

    const newIp = document.querySelector(".dhcp-form #ip-dhcp").value;
    const newNetmask = document.querySelector(".dhcp-form #netmask-dhcp").value;
    const newGateway = document.querySelector(".dhcp-form #gateway-dhcp").value;
    const newRangeStart = document.querySelector(".dhcp-form #range-start").value;
    const newRangeEnd = document.querySelector(".dhcp-form #range-end").value;
    const newOfferGateway = document.querySelector(".dhcp-form #offer-gateway").value;
    const newOfferNetmask = document.querySelector(".dhcp-form #offer-netmask").value;
    const newOfferDns = document.querySelector(".dhcp-form #offer-dns").value;
    const newOfferLeaseTime = document.querySelector(".dhcp-form #offer-lease-time").value;

    //guardamos los nuevos atributos en el server

    networkObject.setAttribute("ip-enp0s3", newIp);
    networkObject.setAttribute("netmask-enp0s3", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-range-start", newRangeStart);
    networkObject.setAttribute("data-range-end", newRangeEnd);
    networkObject.setAttribute("offer-gateway", newOfferGateway);
    networkObject.setAttribute("offer-netmask", newOfferNetmask);
    networkObject.setAttribute("offer-dns", newOfferDns);
    networkObject.setAttribute("offer-lease-time", newOfferLeaseTime);

    //ocultamos el formulario

    document.querySelector(".dhcp-form").style.display = "none";

}
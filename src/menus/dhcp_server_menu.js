function dhcp_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-form", "modal");

    $menu.innerHTML = `
    
        <p id="form-dhcp-item-id"></p>

        <div class="main-section">

            <div>
                <label for="ip-dhcp">Dirección IP (ipv4):</label>
                <input type="text" id="ip-dhcp" name="ip-dhcp" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div >
                <label for="netmask-dhcp">Máscara de Red:</label>
                <input type="text" id="netmask-dhcp" name="netmask-dhcp" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div >
                <label for="gateway-dhcp">Puerta de enlace:</label>
                <input type="text" id="gateway-dhcp" name="gateway-dhcp" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <p> Opciones de Servicio DHCP </p>

            <div>
                <label for="range-start">Rango de IPs:</label>
                <input type="text" id="range-start" name="range-start" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                <input type="text" id="range-end" name="range-end" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div>
                <label for="offer-netmask">Máscara de Red:</label>	
                <input type="text" id="offer-netmask" name="offer-netmask" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div>
                <label for="offer-gateway">Puerta de Enlace:</label>
                <input type="text" id="offer-gateway" name="offer-gateway" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div>
                <label for="offer-dns">Servidor DNS:</label>
                <input type="text" id="offer-dns" name="offer-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
            </div>

            <div>
                <label for="offer-lease-time">Tiempo de Alquiler:</label>
                <input type="text" id="offer-lease-time" name="offer-lease-time" pattern="^[0-9]+$">
            </div>

            <button class="btn-modern-blue dark" id="show-reservations">Ver IPs Reservadas</button>           
            <button class="btn-modern-blue" type="submit">Guardar</button>

        </div>

        <div class="reservations-section" style="display: none;">

            <div>
                <input type="text" id="mac-for-reserve" name="mac-for-reserve" pattern="^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$">
                <input type="text" id="ip-to-reserve" name="ip-to-reserve" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                <button class="btn-modern-blue dark small" id="add-reservation">Agregar</button>
            </div>

            <div class="reservations-table-wrapper">
                <table id="reservations-table">
                    <tr>
                        <th>MAC</th>
                        <th>IP</th>
                    </tr>
                </table>
            </div>

            <button class="btn-modern-blue dark" id="go-back">Volver</button>

        </div>

    `;

    $menu.addEventListener("submit", saveDhcpSpecs);
    $menu.querySelector("#show-reservations").addEventListener("click", showReservationsSection);
    $menu.querySelector("#go-back").addEventListener("click", goBacktoMainDchpForm);
    $menu.querySelector("#add-reservation").addEventListener("click", addDhcpReservationHandler);
    return $menu;
    
}

function showDhcpSpecs(event) {

    event.stopPropagation();
    
    const networkObject = event.target.closest(".item-dropped");
    const networkObjectId = networkObject.id;
    const isDhcpServer = networkObjectId.startsWith("dhcp-server-");
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const reservations = genDhcpReservationsRows(networkObjectId);
    const ip = networkObject.getAttribute("ip-enp0s3");
    const netmask = networkObject.getAttribute("netmask-enp0s3");
    const gateway = networkObject.getAttribute("data-gateway");
    const rangeStart = networkObject.getAttribute("data-range-start");
    const rangeEnd = networkObject.getAttribute("data-range-end");
    const offerGateway = networkObject.getAttribute("offer-gateway");
    const offerNetmask = networkObject.getAttribute("offer-netmask");
    const offerDns = networkObject.getAttribute("offer-dns");
    const offerLeaseTime = networkObject.getAttribute("offer-lease-time");

    if (icmpTryoutToggle) {
        icmpTryoutProcess(networkObjectId);
        return;
    }

    $menu.querySelector("#ip-dhcp").value = ip;
    $menu.querySelector("#netmask-dhcp").value = netmask;
    $menu.querySelector("#gateway-dhcp").value = gateway;
    $menu.querySelector("#range-start").value = rangeStart;
    $menu.querySelector("#range-end").value = rangeEnd;
    $menu.querySelector("#offer-gateway").value = offerGateway;
    $menu.querySelector("#offer-netmask").value = offerNetmask;
    $menu.querySelector("#offer-dns").value = offerDns;
    $menu.querySelector("#offer-lease-time").value = offerLeaseTime;
    $menu.querySelector("#ip-dhcp").disabled = (isDhcpServer) ? false : true;
    $menu.querySelector("#netmask-dhcp").disabled = (isDhcpServer) ? false : true;
    $menu.querySelector("#gateway-dhcp").disabled = (isDhcpServer) ? false : true;
    reservations.forEach($reservation => $reservationsTable.appendChild($reservation)); 
    $menu.querySelector("#form-dhcp-item-id").innerHTML = networkObjectId;
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";

}

function saveDhcpSpecs(event) {

    event.preventDefault();
    const $networkObject = document.getElementById(document.getElementById("form-dhcp-item-id").innerHTML);
    const $menu = document.querySelector(".dhcp-form");

    const newIp = $menu.querySelector("#ip-dhcp").value;
    const newNetmask = $menu.querySelector("#netmask-dhcp").value;
    const newGateway = $menu.querySelector("#gateway-dhcp").value;
    const newRangeStart = $menu.querySelector("#range-start").value;
    const newRangeEnd = $menu.querySelector("#range-end").value;
    const newOfferGateway = $menu.querySelector("#offer-gateway").value;
    const newOfferNetmask = $menu.querySelector("#offer-netmask").value;
    const newOfferDns = $menu.querySelector("#offer-dns").value;
    const newOfferLeaseTime = $menu.querySelector("#offer-lease-time").value;

    $networkObject.setAttribute("ip-enp0s3", newIp);
    $networkObject.setAttribute("netmask-enp0s3", newNetmask);
    $networkObject.setAttribute("data-gateway", newGateway);
    $networkObject.setAttribute("data-range-start", newRangeStart);
    $networkObject.setAttribute("data-range-end", newRangeEnd);
    $networkObject.setAttribute("offer-gateway", newOfferGateway);
    $networkObject.setAttribute("offer-netmask", newOfferNetmask);
    $networkObject.setAttribute("offer-dns", newOfferDns);
    $networkObject.setAttribute("offer-lease-time", newOfferLeaseTime);

    restoreDhcpReservationTable();
    $menu.style.display = "none";
}

function showReservationsSection(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelector(".main-section").style.display = "none";
    $menu.querySelector(".reservations-section").style.display = "flex";
}

function goBacktoMainDchpForm(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelector(".main-section").style.display = "flex";
    $menu.querySelector(".reservations-section").style.display = "none";
}

function addDhcpReservationHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const networkObjectId = document.querySelector(".dhcp-form #form-dhcp-item-id").innerHTML;
    const macForReservation = $menu.querySelector("#mac-for-reserve").value;
    const ipToReserve = $menu.querySelector("#ip-to-reserve").value;

    try {
        addDhcpReservation(networkObjectId, macForReservation, ipToReserve);
        $menu.querySelector("#mac-for-reserve").value = "";
        $menu.querySelector("#ip-to-reserve").value = "";
        restoreDhcpReservationTable()
        genDhcpReservationsRows(networkObjectId).forEach($reservation => $reservationsTable.appendChild($reservation));
    } catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

function removeDhcpReservationHandler(networkObjectId, mac, event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = document.getElementById(networkObjectId);
    removeDhcpReservation($networkObject.id, mac);
    restoreDhcpReservationTable();
    genDhcpReservationsRows(networkObjectId).forEach($reservation => $reservationsTable.appendChild($reservation));
    bodyComponent.render(popupMessage(`La MAC ${mac} ha sido eliminada de la lista de reservas.`));
}

function restoreDhcpReservationTable() {
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    $reservationsTable.innerHTML = `
    <tr>
        <th>MAC</th>
        <th>IP</th>
    </tr>
    `;
}

function genDhcpReservationsRows(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const reservations = JSON.parse($networkObject.getAttribute("ip-reservations"));
    const rows = [];

    for (let reservation in reservations) {
        const $newRow = document.createElement("tr");
        $newRow.innerHTML = `
            <td>${reservation}</td>
            <td class="ip-field">
                <p>${reservations[reservation]}</p>
                <button 
                class="btn-modern-blue dark small no-animation" 
                onclick="removeDhcpReservationHandler('${networkObjectId}', '${reservation}',event)">
                    Eliminar
                </button>
            </td>
        `;
        rows.push($newRow);
    }

    return rows;
}

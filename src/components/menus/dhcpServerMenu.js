function dhcp_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dhcp-form", "modal", "draggable-modal");

    $menu.innerHTML = `
    
        <div class="window-frame"> <p id="form-dhcp-item-id"> </p> </div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab">Básico</button>
            <button class="btn-modern-blue dark" id="btn-reservations">Reservas</button>
        </div>

        <section class="main-section">

            <section class="basic-section">

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

            </section>

            <section class="dhcp-options-section">

                <p> Opciones de Servicio DHCP </p>

                <div>
                    <label for="dhcp-listen-on-interfaces">Interfaces de escucha:</label>
                    <input type="text" id="dhcp-listen-on-interfaces" name="dhcp-listen-on-interfaces" placeholder="enp0s3,enp0s8">
                </div>

                <div>
                    <label for="range-start">Rango de IPs:</label>
                    <input type="text" id="range-start" name="range-start" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                    <input type="text" id="range-end" name="range-end" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                </div>

                <div>
                    <label for="dhcp-offer-netmask">Máscara de Red:</label>	
                    <input type="text" id="dhcp-offer-netmask" name="dhcp-offer-netmask" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                </div>

                <div>
                    <label for="dhcp-offer-gateway">Puerta de Enlace:</label>
                    <input type="text" id="dhcp-offer-gateway" name="dhcp-offer-gateway" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                </div>

                <div>
                    <label for="dhcp-offer-dns">Servidor DNS:</label>
                    <input type="text" id="dhcp-offer-dns" name="dhcp-offer-dns" pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
                </div>

                <div>
                    <label for="dhcp-offer-lease-time">Tiempo de Alquiler:</label>
                    <input type="text" id="dhcp-offer-lease-time" name="dhcp-offer-lease-time" pattern="^[0-9]+$">
                </div>

            </section>
            
            <div class="button-wrapper">
                <button class="btn-modern-blue dark" type="submit" id="btn-save-form">Guardar</button>
                <button class="btn-modern-red dark" id="close-btn">Cerrar</button>
            </div>

        </section>

        <section class="reservations-section" style="display: none;">

            <div>
                <label for="mac-for-reserve">Dirección MAC:</label>
                <input type="text" id="mac-for-reserve" name="mac-for-reserve" 
                pattern="^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$" placeholder="00:00:00:00:00:00">
            </div>

            <div>
                <label for="ip-to-reserve">Dirección IP (IPv4):</label>
                <input type="text" id="ip-to-reserve" name="ip-to-reserve" 
                pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" placeholder="192.168.0.1">
            </div>
            
            <button class="btn-modern-blue dark small" id="add-reservation">Agregar</button>

            <div class="reservations-table-wrapper">
                <table id="reservations-table" class="inner-table">
                    <tr>
                        <th>MAC</th>
                        <th>IP</th>
                    </tr>
                </table>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", saveDhcpMenu);
    $menu.querySelector("#btn-basic-tab").addEventListener("click", showBasicTab);
    $menu.querySelector("#btn-reservations").addEventListener("click", showReservTab);
    $menu.querySelector("#add-reservation").addEventListener("click", addDhcpReservationHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeDhcpMenu);

    return $menu;
    
}

function showDhcpMenu(event) {

    event.stopPropagation();
    
    const $networkObject = event.target.closest(".item-dropped");
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const networkObjectId = $networkObject.id;
    const isDhcpServer = networkObjectId.startsWith("dhcp-server-");
    const reservations = genDhcpReservationsRows(networkObjectId);

    if (icmpTryoutToggle) {
        icmpTryoutProcess(networkObjectId);
        return;
    }

    //añadimos los atributos del servidor al menú

    $menu.querySelector("#form-dhcp-item-id").innerHTML = networkObjectId;
    $menu.querySelector("#ip-dhcp").value = $networkObject.getAttribute("ip-enp0s3");
    $menu.querySelector("#netmask-dhcp").value = $networkObject.getAttribute("netmask-enp0s3");
    $menu.querySelector("#gateway-dhcp").value = $networkObject.getAttribute("data-gateway");
    $menu.querySelector("#dhcp-listen-on-interfaces").value = $networkObject.getAttribute("dhcp-listen-on-interfaces");
    $menu.querySelector("#range-start").value = $networkObject.getAttribute("data-range-start");
    $menu.querySelector("#range-end").value = $networkObject.getAttribute("data-range-end");
    $menu.querySelector("#dhcp-offer-gateway").value = $networkObject.getAttribute("dhcp-offer-gateway");
    $menu.querySelector("#dhcp-offer-netmask").value = $networkObject.getAttribute("dhcp-offer-netmask");
    $menu.querySelector("#dhcp-offer-dns").value = $networkObject.getAttribute("dhcp-offer-dns");
    $menu.querySelector("#dhcp-offer-lease-time").value = $networkObject.getAttribute("dhcp-offer-lease-time");
    reservations.forEach($reservation => $reservationsTable.appendChild($reservation));

    if (!isDhcpServer) $menu.querySelector(".basic-section").classList.add("hidden");
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none"; 
    $menu.style.display = "flex";

}

function saveDhcpMenu(event) {

    event.preventDefault();
    const $networkObject = document.getElementById(document.getElementById("form-dhcp-item-id").innerHTML);
    const $menu = document.querySelector(".dhcp-form");
    const networkObjectInterfaces = getInterfaces($networkObject.id);
    const listenOnInterfaces = $menu.querySelector("#dhcp-listen-on-interfaces").value.split(",").map(item => item.trim()).filter(item => item !== "");
    const isDhcpServer = $networkObject.id.startsWith("dhcp-server-");
    
    if (isDhcpServer) {
        configureInterface($networkObject.id, $menu.querySelector("#ip-dhcp").value, $menu.querySelector("#netmask-dhcp").value, "enp0s3");
        setDirectRoutingRule($networkObject.id, $menu.querySelector("#ip-dhcp").value, $menu.querySelector("#netmask-dhcp").value, "enp0s3");
        $networkObject.setAttribute("data-gateway", $menu.querySelector("#gateway-dhcp").value);
        setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", $menu.querySelector("#ip-dhcp").value, "enp0s3", $menu.querySelector("#gateway-dhcp").value);
    }

    if (!listenOnInterfaces.every(item => networkObjectInterfaces.includes(item))) {
        bodyComponent.render(popupMessage(`<span>Error: </span> Algunas de las interfaces de escucha no son válidas.</span>`));
        return;
    }

    $networkObject.setAttribute("data-range-start", $menu.querySelector("#range-start").value);
    $networkObject.setAttribute("data-range-end", $menu.querySelector("#range-end").value);
    $networkObject.setAttribute("dhcp-offer-gateway", $menu.querySelector("#dhcp-offer-gateway").value);
    $networkObject.setAttribute("dhcp-offer-netmask", $menu.querySelector("#dhcp-offer-netmask").value);
    $networkObject.setAttribute("dhcp-offer-dns", $menu.querySelector("#dhcp-offer-dns").value);
    $networkObject.setAttribute("dhcp-offer-lease-time", $menu.querySelector("#dhcp-offer-lease-time").value);
    $networkObject.setAttribute("dhcp-listen-on-interfaces", listenOnInterfaces.join(","));

    bodyComponent.render(popupMessage(`Los cambios se han guardado correctamente.`));
}

function closeDhcpMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    restoreDhcpReservationTable();
    $menu.querySelector(".basic-section").classList.remove("hidden");
    $menu.style.display = "none";
}

function showBasicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelectorAll(".active").forEach($button => $button.classList.remove("active"));
    $menu.querySelector("#btn-basic-tab").classList.add("active");
    $menu.querySelector(".main-section").style.display = "flex";
    $menu.querySelector(".reservations-section").style.display = "none";
}

function showReservTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelectorAll(".active").forEach($button => $button.classList.remove("active"));
    $menu.querySelector("#btn-reservations").classList.add("active");
    $menu.querySelector(".main-section").style.display = "none";
    $menu.querySelector(".reservations-section").style.display = "flex";
}

function addDhcpReservationHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const networkObjectId = document.querySelector(".dhcp-form #form-dhcp-item-id").innerHTML;
    const macForReservation = $menu.querySelector("#mac-for-reserve").value.toUpperCase();
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
    const reservations = JSON.parse($networkObject.getAttribute("dhcp-reservations"));
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

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
                    <input type="text" id="ip-dhcp" name="ip-dhcp">
                </div>

                <div >
                    <label for="netmask-dhcp">Máscara de Red:</label>
                    <input type="text" id="netmask-dhcp" name="netmask-dhcp">
                </div>

                <div >
                    <label for="gateway-dhcp">Puerta de enlace:</label>
                    <input type="text" id="gateway-dhcp" name="gateway-dhcp">
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
                    <input type="text" id="range-start" name="range-start">
                    <input type="text" id="range-end" name="range-end">
                </div>

                <div>
                    <label for="dhcp-offer-netmask">Máscara de Red:</label>	
                    <input type="text" id="dhcp-offer-netmask" name="dhcp-offer-netmask">
                </div>

                <div>
                    <label for="dhcp-offer-gateway">Puerta de Enlace:</label>
                    <input type="text" id="dhcp-offer-gateway" name="dhcp-offer-gateway">
                </div>

                <div>
                    <label for="dhcp-offer-dns">Servidor DNS:</label>
                    <input type="text" id="dhcp-offer-dns" name="dhcp-offer-dns">
                </div>

                <div>
                    <label for="dhcp-offer-lease-time">Tiempo de Alquiler:</label>
                    <input type="text" id="dhcp-offer-lease-time" name="dhcp-offer-lease-time">
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

/**ESTA FUNCION MUESTRA EL MENU DE DHCP SERVER */
function showDhcpMenu(event) {

    event.stopPropagation();
    
    //atributos del equipo
    const $networkObject = event.target.closest(".item-dropped");
    const networkObjectId = $networkObject.id;
    const availableInterfaces = getInterfaces(networkObjectId);
    const networkObjectInterface = availableInterfaces[0];

    //atributos del servicio
    const $menu = document.querySelector(".dhcp-form");
    const $reservationsTable = $menu.querySelector("#reservations-table");
    const isDhcpServer = networkObjectId.startsWith("dhcp-server-");
    const reservations = genDhcpReservationsRows(networkObjectId);

    if (quickPingToggle) {
        quickPing(networkObjectId);
        return;
    }

    //añadimos los atributos del servidor al menú

    $menu.querySelector("#form-dhcp-item-id").innerHTML = networkObjectId;
    $menu.querySelector("#ip-dhcp").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    $menu.querySelector("#netmask-dhcp").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
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

/**ESTA FUNCION GUARDA LOS CAMBIOS DE CONFIGURACIÓN DE UN SERVIDOR DHCP */
function saveDhcpMenu(event) {

    event.preventDefault();

    const $networkObject = document.getElementById(document.getElementById("form-dhcp-item-id").innerHTML);
    const $menu = document.querySelector(".dhcp-form");
    const availableInterfaces = getInterfaces($networkObject.id);
    const networkObjectInterface = availableInterfaces[0];
    const listenOnInterfaces = $menu.querySelector("#dhcp-listen-on-interfaces").value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
    const isDhcpServer = $networkObject.id.startsWith("dhcp-server-");
    
    //validamos el formulario

    try {
        validateDhcpForm();
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
        return;
    }

    //aplicamos los cambios

    if (isDhcpServer) {
        configureInterface($networkObject.id, $menu.querySelector("#ip-dhcp").value, $menu.querySelector("#netmask-dhcp").value, networkObjectInterface);
        setDirectRoutingRule($networkObject.id, $menu.querySelector("#ip-dhcp").value, $menu.querySelector("#netmask-dhcp").value, networkObjectInterface);
        $networkObject.setAttribute("data-gateway", $menu.querySelector("#gateway-dhcp").value);
        setRemoteRoutingRule($networkObject.id, "0.0.0.0", "0.0.0.0", $menu.querySelector("#ip-dhcp").value, networkObjectInterface, $menu.querySelector("#gateway-dhcp").value);
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

/**ESTA FUNCION VALIDA LOS CAMPOS DEL FORMULARIO DE CONFIGURACIÓN DE UN SERVIDOR DHCP */
function validateDhcpForm() {

    const $menu = document.querySelector(".dhcp-form");
    const $networkObject = document.getElementById(document.getElementById("form-dhcp-item-id").innerHTML);
    const availableInterfaces = getInterfaces($networkObject.id);
    const isDhcpServer = $networkObject.id.startsWith("dhcp-server-");

    //obtenemos todos los campos del formulario

    const ip = $menu.querySelector("#ip-dhcp").value;
   
    const netmask = $menu.querySelector("#netmask-dhcp").value;
    
    const gateway = $menu.querySelector("#gateway-dhcp").value;
    
    const dhcpListenOnInterfaces = $menu.querySelector("#dhcp-listen-on-interfaces").value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
    
    const rangeStart = $menu.querySelector("#range-start").value;
    
    const rangeEnd = $menu.querySelector("#range-end").value;
    
    const dhcpOfferGateway = $menu.querySelector("#dhcp-offer-gateway").value;
    
    const dhcpOfferNetmask = $menu.querySelector("#dhcp-offer-netmask").value;
    
    const dhcpOfferDnsServers = $menu.querySelector("#dhcp-offer-dns").value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");

    const dhcpOfferLeaseTime = $menu.querySelector("#dhcp-offer-lease-time").value;

    //validamos los campos

    if (isDhcpServer) {
        if (!isValidIp(ip)) throw new Error(`Error: se esperaba una ip válida en vez de "${ip}".`);
        if (!isValidIp(netmask)) throw new Error(`Error: se esperaba una máscara de red válida en vez de "${netmask}".`);
        if (!isValidIp(gateway)) throw new Error(`Error: se esperaba una puerta de enlace válida en vez de "${gateway}".`);
    }

    if (!isDhcpModuleEmpty()) {

        validateDhpcConfiguration($networkObject.id,
            {
                dhcpListenOnInterfaces: dhcpListenOnInterfaces,
                rangeStart: rangeStart,
                rangeEnd: rangeEnd,
                dhcpOfferGateway: dhcpOfferGateway,
                dhcpOfferNetmask: dhcpOfferNetmask,
                dhcpOfferDnsServers: dhcpOfferDnsServers,
                dhcpOfferLeaseTime: dhcpOfferLeaseTime
            }
        );

    }

}

/**ESTA FUNCION CERRA EL MENU DE CONFIGURACIÓN DE UN SERVIDOR DHCP */
function closeDhcpMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    restoreDhcpReservationTable();
    $menu.querySelector(".basic-section").classList.remove("hidden");
    $menu.style.display = "none";
}

/**ESTA FUNCION MUESTRA LA PESTAÑA BÁSICA DE CONFIGURACIÓN DE UN SERVIDOR DHCP */
function showBasicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelectorAll(".active").forEach($button => $button.classList.remove("active"));
    $menu.querySelector("#btn-basic-tab").classList.add("active");
    $menu.querySelector(".main-section").style.display = "flex";
    $menu.querySelector(".reservations-section").style.display = "none";
}

/**ESTA FUNCIÓN MUESTRA LA PESTAÑA DE RESERVAS DE ALQUILERES DE UN SERVIDOR DHCP */
function showReservTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dhcp-form");
    $menu.querySelectorAll(".active").forEach($button => $button.classList.remove("active"));
    $menu.querySelector("#btn-reservations").classList.add("active");
    $menu.querySelector(".main-section").style.display = "none";
    $menu.querySelector(".reservations-section").style.display = "flex";
}

/**ESTA FUNCIÓN AÑADE UNA NUEVA RESERVA DE ALQUILER A UN SERVIDOR DHCP */
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

/**ESTA FUNCIÓN ELIMINA UNA RESERVA DE ALQUILER DE UN SERVIDOR DHCP */
function removeDhcpReservationHandler(networkObjectId, mac, event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = document.getElementById(networkObjectId);
    removeDhcpReservation($networkObject.id, mac);
    restoreDhcpReservationTable();
    genDhcpReservationsRows(networkObjectId).forEach($reservation => $reservationsTable.appendChild($reservation));
    bodyComponent.render(popupMessage(`La MAC ${mac} ha sido eliminada de la lista de reservas.`));
}

/**ESTA FUNCIÓN RESTAURA LA TABLA DE RESERVAS DE ALQUILERES DE UN SERVIDOR DHCP */
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

/**ESTA FUNCIÓN DEVUELVE LA TABLA DE RESERVAS DE ALQUILERES DE UN SERVIDOR DHCP COMO ELEMENTOS ROWS DE HTML*/
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

/**ESTA FUNCION DEVUELVE TRUE SI EL MODULO DE OPCIONES DE CONFIGURACIÓN DE UN SERVIDOR DHCP ESTA VACIO */
function isDhcpModuleEmpty() {
    const $dhcpMenu = document.querySelector(".dhcp-form");
    const $optionsModule = $dhcpMenu.querySelector(".dhcp-options-section");
    const $optionsModuleInputs = $optionsModule.querySelectorAll("input");
    return Array.from($optionsModuleInputs).every(input => input.value === "");
}
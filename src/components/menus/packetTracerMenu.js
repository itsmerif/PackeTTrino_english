let trafficBuffer = [];

function packetTracer() {

    const $packetTracer = document.createElement("article");
    $packetTracer.classList.add("packet-traffic");

    $packetTracer.innerHTML = `
        <div class="filter-traffic">
            <input type="text">
            <button id="filter-traffic-button">Filtrar</button>
            <button id="clean-traffic-button">Limpiar</button>
            <select id="filter-by-device">
                <option value="all">Todos</option>
            </select>
        </div>
        <table>
        <tr>
            <th>XID</th>
            <th>Protocol</th>
            <th>Type</th>
            <th>Origin IP</th>
            <th>Destination IP</th>
            <th>Origin MAC</th>
            <th>Destination MAC</th>
            <th>TTL</th>
        </tr>
        </table>
    `;

    $packetTracer.querySelector("input").addEventListener("keydown", (event) => { if (event.key === "Enter") filterPacketTraffic(); });
    $packetTracer.querySelector("#filter-traffic-button").addEventListener("click", filterPacketTraffic);
    $packetTracer.querySelector("#clean-traffic-button").addEventListener("click", cleanPacketTraffic);
    $packetTracer.querySelector("#filter-by-device").addEventListener("change", filterPacketTrafficbyDevice);

    return $packetTracer;

}

function addPacketTraffic(packet) {
    trafficBuffer.push(packet);
    const $table = document.querySelector(".packet-traffic table");
    let protocol = packet.protocol || "N/A";
    let type = packet.type;
    let destinationIP = packet.destination_ip;
    let originIP = packet.origin_ip;
    let destinationMAC = packet.destination_mac;
    let originMAC = packet.origin_mac;
    let ttl = packet.ttl || "N/A";
    let xid = packet.xid || "N/A";

    $table.innerHTML += `
        <tr>
            <td><a onclick="showPacketFields(event)" data-buffer="${trafficBuffer.length - 1}">${xid}</a></td>
            <td>${protocol}</td>
            <td>${type}</td>
            <td>${originIP}</td>
            <td>${destinationIP}</td>
            <td>${originMAC}</td>
            <td>${destinationMAC}</td>
            <td>${ttl}</td>
        </tr>
    `;
}

function showPacketTraffic() {

    const $packetTraffic = document.querySelector(".packet-traffic");

    if ($packetTraffic.style.display === "flex") {
        removeDevicesFromTraffic();
        $packetTraffic.style.overflow = "hidden";
        $packetTraffic.style.display = "none";
        return;
    }

    insertDevicesToTraffic();
    $packetTraffic.style.overflow = "auto";
    $packetTraffic.style.display = "flex";
}

/**ESTA FUNCION LIMPIA EL BUFFER GENERAL DE PAQUETES Y LA TABLA DE TRAFICO */
function cleanPacketTraffic() {

    trafficBuffer = [];
    
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $table = $packetTraffic.querySelector("table");
    const $trs = $table.querySelectorAll("tr");

    for (let i = 1; i < $trs.length; i++) {
        $trs[i].remove();
    }

}

/**ESTA FUNCION FILTRA LA TABLA DE TRAFICO USANDO UNA BUSQUEDA */
function filterPacketTraffic() {

    const $packetTraffic = document.querySelector(".packet-traffic");
    const $table = $packetTraffic.querySelector("table");
    const $trs = $table.querySelectorAll("tr");

    let filter = document.querySelector(".filter-traffic input").value.toLowerCase();

    for (let i = 1; i < $trs.length; i++) {
        let $tr = $trs[i];
        let $tds = $tr.querySelectorAll("td");
        let protocol = $tds[0].innerHTML;
        let type = $tds[1].innerHTML;
        let originIP = $tds[2].innerHTML;
        let destinationIP = $tds[3].innerHTML;
        let originMAC = $tds[4].innerHTML;
        let destinationMAC = $tds[5].innerHTML;
        let destinationPort = $tds[6].innerHTML;
        let xid = $tds[7].innerHTML;

        if (protocol.includes(filter)
            || type.includes(filter)
            || originIP.includes(filter)
            || destinationIP.includes(filter)
            || originMAC.includes(filter)
            || destinationMAC.includes(filter)
            || destinationPort.includes(filter)
            || xid.includes(filter)
        ) {
            $tr.style.display = "table-row";
        } else {
            $tr.style.display = "none";
        }
    }

}

/**ESTA FUNCION GENERA UN MODAL CON INFORMACION DETALLADA DE CADA PAQUETE DE LA TABLA DE TRAFICO */
function showPacketFields(event) {
    //document.querySelector(".modal-overlay").style.display = "block";
    bodyComponent.render(packetInfo(event));
}

/**ESTA FUNCION ELIMINA EL MODAL DE INFORMACION DETALLADA DE PAQUETES */
function closePacketFieldsModal() {
    const modalComponent = document.querySelector(".packet-fields-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    modalComponent.removeEventListener("click", closePacketFieldsModal);
    modalComponent.remove();
}

/**ESTA FUNCION AGREGA LOS DISPOSITIVOS ACTUALES A LA TABLA DE TRAFICO PARA FILTRARLOS */
function insertDevicesToTraffic() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficSelect = $packetTraffic.querySelector("#filter-by-device");
    const $devices = document.querySelectorAll(".item-dropped");
    $devices.forEach(($device) => {
        let deviceName = $device.id;
        if (deviceName.startsWith("switch-")) return;
        $packetTrafficSelect.innerHTML += `<option value="${$device.id}">${$device.id}</option>`;
    });
}

/**ESTA FUNCION REESTABLECE EL SELECTOS DE DISPOSITIVOS DE LA TABLA DE TRAFICO */
function removeDevicesFromTraffic() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficSelect = $packetTraffic.querySelector("#filter-by-device");
    $packetTrafficSelect.innerHTML = `<option value="all">Todos</option>`;
}

/**ESTA FUNCION FILTRA LA TABLA DE TRAFICO POR DISPOSITIVO */
function filterPacketTrafficbyDevice() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficTable = $packetTraffic.querySelector("table");
    const $device = document.getElementById($packetTraffic.querySelector("#filter-by-device").value);
    const deviceMacs = getMacAddresses($device.id);
    const $packets = $packetTrafficTable.querySelectorAll("tr");

    $packets.forEach(($packet) => {
        let $fields = $packet.querySelectorAll("td");
        if ($fields.length < 1) return;
        let originMac = $fields[5].innerHTML;
        let destinationMac = $fields[6].innerHTML;
        if (deviceMacs.includes(originMac) || deviceMacs.includes(destinationMac)) {
            $packet.style.display = "table-row";
        } else {
            $packet.style.display = "none";
        }
    });

}

/**ESTA FUNCION OCULTA EL PANEL DE TRAFICO DE PAQUETES */
function closeTraffic() {
    const $traffic = document.querySelector(".packet-traffic");
    $traffic.style.display = "none";
}
function packetTracer() {

    const $packetTracer = document.createElement("article");
    $packetTracer.classList.add("packet-traffic", "draggable-modal");

    $packetTracer.innerHTML = `

        <div class="window-frame"><p>Packet Tracker</p></div>

        <div class="filter-traffic">
            <input type="text">
            <button class="btn-blue" id="filter-traffic-button">Filter</button>
            <button class="btn-blue" id="clean-traffic-button">Clear</button>
            <select id="filter-by-device">
                <option value="all">All</option>
            </select>
        </div>

        <div class="table-wrapper">
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
        </div>
    `;

    $packetTracer.querySelector("input").addEventListener("keydown", (event) => { if (event.key === "Enter") filterPacketTraffic(); });
    $packetTracer.querySelector("#filter-traffic-button").addEventListener("click", filterPacketTraffic);
    $packetTracer.querySelector("#clean-traffic-button").addEventListener("click", cleanPacketTraffic);
    $packetTracer.querySelector("#filter-by-device").addEventListener("change", filterPacketTrafficbyDevice);
    $packetTracer.querySelector(".window-frame").addEventListener("mousedown", dragModal);

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

/**THIS FUNCTION CLEARS THE OVERALL PACKET BUFFER AND TRAFFIC TABLE*/
function cleanPacketTraffic() {

    trafficBuffer = [];
    
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $table = $packetTraffic.querySelector("table");
    const $trs = $table.querySelectorAll("tr");

    for (let i = 1; i < $trs.length; i++) {
        $trs[i].remove();
    }

}

/**THIS FUNCTION FILTERS THE TRAFFIC TABLE USING A SEARCH*/
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

/**THIS FUNCTION GENERATES A MODAL WITH DETAILED INFORMATION ABOUT EACH PACKET IN THE TRAFFIC TABLE*/
function showPacketFields(event) {
    //document.querySelector(".modal-overlay").style.display = "block";
    bodyComponent.render(packetInfo(event));
}
/**THIS FUNCTION DELETES THE DETAILED PACKET INFORMATION MODAL*/

function closePacketFieldsModal() {
    const modalComponent = document.querySelector(".packet-fields-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    modalComponent.removeEventListener("click", closePacketFieldsModal);
    modalComponent.remove();
}

/**THIS FUNCTION ADDS CURRENT DEVICES TO THE TRAFFIC TABLE FOR FILTERING*/
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

/**THIS FUNCTION RESETS THE DEVICE SELECT IN THE TRAFFIC TABLE*/
function removeDevicesFromTraffic() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficSelect = $packetTraffic.querySelector("#filter-by-device");
    $packetTrafficSelect.innerHTML = `<option value="all">All</option>`;
}

/**THIS FUNCTION FILTER TRAFFIC TABLE BY DEVICE */
function filterPacketTrafficbyDevice() {
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $packetTrafficTable = $packetTraffic.querySelector("table");
    const selectValue = $packetTraffic.querySelector("#filter-by-device").value;

    if (selectValue === "all") {
        $packetTrafficTable.querySelectorAll("tr").forEach($packet => $packet.style.display = "table-row");
        return;
    }

    const $device = document.getElementById(selectValue);
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

/**This function hides the parcel traffic panel*/
function closeTraffic() {
    const $traffic = document.querySelector(".packet-traffic");
    $traffic.style.display = "none";
}

//** translated by itsmeRiF **/

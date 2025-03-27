let trafficBuffer = [];

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
        $packetTraffic.style.display = "none";
    } else {
        $packetTraffic.style.overflow = "auto";
        $packetTraffic.style.display = "flex";
    }
}

function cleanPacketTraffic() {

    trafficBuffer = [];
    
    const $packetTraffic = document.querySelector(".packet-traffic");
    const $table = $packetTraffic.querySelector("table");
    const $trs = $table.querySelectorAll("tr");

    for (let i = 1; i < $trs.length; i++) {
        $trs[i].remove();
    }

}

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

function showPacketFields(event) {

    const packet = trafficBuffer[event.target.dataset.buffer];
    const packetFields = Object.entries(packet);

    //campos por capa

    const layer1Fields = [];

    const layer2Fields = [
        "origin_mac",
        "destination_mac"
    ];

    const layer3Fields = [
        "destination_ip", "origin_ip", "ttl", "xid"
    ];

    const layer4Fields = [
        "sequence_number", "ack_number"
    ];

    const layer5Fields = [];

    const layer6Fields = [];

    const layer7Fields = [
        "method", "header", "body",
        "ciaddr", "giaddr", "siaddr", "yiaddr", "chaddr",
        "query", "answer", "answer_type", "answer"
    ];

    const layers = [layer1Fields, layer2Fields, layer3Fields, layer4Fields, layer5Fields, layer6Fields, layer7Fields]

    //creamos los campos

    let $packetPrint = [[], [], [], [], [], [], []];

    for (let i = 0; i < packetFields.length; i++) {

        if (packetFields[i][0] === "protocol") {

            switch (packetFields[i][1]) {
                case "icmp":
                    $packetPrint[2].push(packetFields[i][1]);
                    break;
                case "arp":
                    $packetPrint[2].push(packetFields[i][1]);
                    break;
                case "dhcp":
                    $packetPrint[6].push(packetFields[i][1]);
                    break;
                case "dns":
                    $packetPrint[6].push(packetFields[i][1]);
                    break;
                case "http":
                    $packetPrint[6].push(packetFields[i][1]);
                    break;
            }

        } else if (packetFields[i][0] === "transport_protocol") {

            switch (packetFields[i][1]) {
                case "tcp":
                    $packetPrint[3].push(packetFields[i][1]);
                    break;
                case "udp":
                    $packetPrint[3].push(packetFields[i][1]);
                    break;
            }

        } else {

            for (let j = 0; j < layers.length; j++) {
                const layer = layers[j];
                if (layer.includes(packetFields[i][0])) {
                    $packetPrint[j].push(packetFields[i][0] + ": " + packetFields[i][1]);
                }
            }

        }
    }

    //creamos el modal
    const modalComponent = document.createElement("div");
    modalComponent.classList.add("packet-fields-modal-container");
    modalComponent.innerHTML = `
    <div class="packet-fields-modal">
        <table>
            <tr>
                <th>Aplicación</th>
                ${$packetPrint[6].map(field => `<td>${escapeHtml(field)}</td>`).join("")}
            </tr>
            <tr>
                <th>Presentación</th>
                ${$packetPrint[5].map(field => `<td>${field}</td>`).join("")}
            </tr>
            <tr>
                <th>Sesión</th>
                ${$packetPrint[4].map(field => `<td>${field}</td>`).join("")}
            </tr>
            <tr>
                <th>Transporte</th>
                ${$packetPrint[3].map(field => `<td>${field}</td>`).join("")}
            </tr>
            <tr>
                <th>Red</th>
                <td>IPv4</td>
                ${$packetPrint[2].map(field => `<td>${field}</td>`).join("")}
            </tr>
            <tr>
                <th>Enlace de Datos</th>
                <td>Ethernet (IEEE 802.3)</td>
                ${$packetPrint[1].map(field => `<td>${field}</td>`).join("")}
            </tr>
            <tr>
                <th>Física</th>
                <td>Ethernet</td>
                ${$packetPrint[0].map(field => `<td>${field}</td>`).join("")}
            </tr>
        </table>
        <button class="btn-close" onclick="closePacketFieldsModal()">Cerrar</button>
    </div>`;

    document.querySelector(".modal-overlay").style.display = "block";
    document.body.appendChild(modalComponent);
}

function closePacketFieldsModal() {
    const modalComponent = document.querySelector(".packet-fields-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    modalComponent.remove();
}


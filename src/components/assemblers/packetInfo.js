function packetInfo(event) {
    
    const packet = trafficBuffer[event.target.dataset.buffer];

    const packetFields = Object.entries(packet);

    const layer1Fields = [];

    const layer2Fields = [
        "origin_mac",
        "destination_mac"
    ];

    const layer3Fields = [
        "destination_ip", "origin_ip", "ttl", "xid"
    ];

    const layer4Fields = [
        "sequence_number", "ack_number" //tcp
    ];

    const layer5Fields = [];

    const layer6Fields = [];

    const layer7Fields = [
        "method", "contentType", "body", "userAgent", "keepalive", "host", "resource", "statusCode", //http
        "ciaddr", "giaddr", "siaddr", "yiaddr", "chaddr", //dhcp
        "query", "answer", "answer_type", "answer", //dns
        "sport", "dport" //puertos
    ];

    const layers = [layer1Fields, layer2Fields, layer3Fields, layer4Fields, layer5Fields, layer6Fields, layer7Fields]

    //creamos los campos

    let $packetPrint = [ [], [], [], [], [], [], [] ];

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

    const $packetInfo = document.createElement("div");

    $packetInfo.classList.add("packet-fields-modal-container");

    $packetInfo.innerHTML = `

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

        </div>
    `;

    if (darkMode) $packetInfo.querySelector(".packet-fields-modal").classList.add("dark-mode");
    return $packetInfo;

}

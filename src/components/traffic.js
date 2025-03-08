function addPacketTraffic(packet) {
    const $table = document.querySelector(".packet-traffic table");
    let protocol = packet.protocol || "N/A";
    let type = packet.type;
    let destinationIP = packet.destination_ip;
    let originIP = packet.origin_ip;
    let destinationMAC = packet.destination_mac;
    let originMAC = packet.origin_mac;
    let ttl = packet.ttl || "N/A";

    $table.innerHTML += `
        <tr>
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

        if (protocol.includes(filter) 
            || type.includes(filter) 
            || originIP.includes(filter) 
            || destinationIP.includes(filter) 
            || originMAC.includes(filter) 
            || destinationMAC.includes(filter) 
            || destinationPort.includes(filter)
        ) {
            $tr.style.display = "table-row";
        } else {
            $tr.style.display = "none";
        }
    }

}

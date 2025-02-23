//variables globales

let itemIndex = 0;
let quickInfoTimeout;
let visualMode = false;
const leaseTimers = {};

// funciones de inicio

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
    getPanelItems();
    await sleep(500);
    document.querySelector(".pc-terminal").addEventListener("keydown", terminalKeyboard);
    document.getElementById("item-panel").querySelector(".ping").addEventListener("click", showPingForm);
    document.querySelector(".pc-form").querySelector("input[type='checkbox']").addEventListener("change", disableOptionsPcForm);
    document.getElementById("item-panel").querySelector(".traffic").addEventListener("click", showPacketTraffic);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") { document.querySelector(".packet-traffic").style.display = "none"; } });
    document.querySelector(".filter-traffic").querySelector("input").addEventListener("keydown", (event) => { if (event.key === "Enter") { filterPacketTraffic(); } });
    removePropagationPingform();
}

function getPanelItems() {
    fetch("./src/components/panel-items.json")
        .then(response => response.json())
        .then(data => {
            const panel = document.getElementById("item-panel");
            data.forEach(item => {
                const itemElement = document.createElement("article");
                itemElement.classList.add("item", item.name);
                itemElement.draggable = item.draggable;
                itemElement.ondragstart = dragStart;
                itemElement.innerHTML = `<img src="${item.image}" alt="${item.name}" draggable="${item.draggable}" style="width: ${item.size}; height: ${item.size};" />`;
                panel.appendChild(itemElement);
            });
        });
}
function deleteMouse() {
    let cursor = document.body.style.cursor;
    if (cursor.includes("cTargetX")) {
        document.body.style.cursor = "default";
    } else {
        document.body.style.cursor = "url('/assets/cTargetX.png'), auto";
    }
}

async function pingSim() {
    const form = document.querySelector(".ping-form");
    const ip1 = form.ip1.value;
    const ip2 = form.ip2.value;
    try {
        await ping(ip1, ip2, true);
        await ping(ip2, ip1, true);
    } catch (error) {
        console.error("Error durante el ping:", error);
    }
}

function showPingForm() {
    const form = document.querySelector(".ping-form");
    if (form.style.display === "none") {
        form.style.display = "flex";
        form.ip1.focus();
    } else {
        form.style.display = "none";
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll(".advanced-options-modal");
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
}

function removePropagationPingform() {
    const form = document.querySelector(".ping-form");
    const inputs = form.querySelectorAll("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("mousedown", event => {
            event.stopPropagation()
        });
    }
}

function downloadState() {
    const elemento = document.querySelector(".board");
    const contenidoHTML = elemento.innerHTML;
    const blob = new Blob([contenidoHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "contenido.html"; // Nombre del archivo
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url); // Liberar el objeto URL
}

function loadState() {
    const archivoInput = document.getElementById("fileInput");
    if (archivoInput.files.length === 0) {
        alert("Por favor, selecciona un archivo.");
        return;
    }
    const archivo = archivoInput.files[0];
    const lector = new FileReader();
    lector.onload = function (event) {
        const contenido = event.target.result;
        document.querySelector(".board").innerHTML = contenido;
        setNewIndex();
        setTextContents();
        startLeaseTimers();
    };
    lector.readAsText(archivo);
}

function setNewIndex() {
    const itemsDropped = document.querySelectorAll(".item-dropped");
    const itemsText = document.querySelectorAll(".text-annotation");
    let indexes = [];

    itemsDropped.forEach(item => {
        let itemid = item.id;
        let itemindex = parseInt(itemid.split("-")[1]);
        if (!isNaN(itemindex)) indexes.push(itemindex);
    });

    itemsText.forEach(item => {
        let itemid = item.id;
        let itemindex = parseInt(itemid.split("-")[1]);
        if (!isNaN(itemindex)) indexes.push(itemindex);
    });

    itemIndex = indexes.length > 0 ? Math.max(...indexes) + 1 : 1;

}

function setTextContents() {

    const itemsText = document.querySelectorAll(".text-annotation");

    for (let i = 0; i < itemsText.length; i++) {
        let text = itemsText[i].getAttribute("data-text");
        let input = itemsText[i].querySelector("input");
        input.value = text;
    }
}

function showTerminal(event) {

    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");

    //mostramos el terminal usando el id del elemento
    const terminal = document.querySelector(".pc-terminal");
    terminal.setAttribute("data-id", networkObject.id);
    terminal.style.display = "block";

    //ocultamos las opciones avanzadas
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
}

async function minimizeTerminal() {
    const terminal = document.querySelector(".pc-terminal");
    if (!terminal) return;

    // Obtener el tamaño de la ventana y la terminal
    const rect = terminal.getBoundingClientRect();
    const originalWidth = rect.width;
    const originalHeight = rect.height;

    // Calcular el nuevo tamaño (30%)
    const targetWidth = originalWidth * 0.3;
    const targetHeight = originalHeight * 0.3;
    const windowHeight = window.innerHeight;

    // Aplicar animación con transición
    terminal.style.transition = "all 1s ease-in-out";
    terminal.style.width = `${targetWidth}px`;
    terminal.style.height = `${targetHeight}px`;

    // Mover a la esquina inferior derecha
    terminal.style.top = `${windowHeight - targetHeight}px`;
    terminal.style.left = "100%";
    terminal.style.transform = "translate(-100%, 0)";

}

async function maximizeTerminal() {
    const terminal = document.querySelector(".pc-terminal");
    if (!terminal) return;

    // Aplicar animación con transición
    terminal.style.transition = "all 1s ease-in-out";

    // Restaurar tamaño original
    terminal.style.width = "1000px";
    terminal.style.height = "500px";

    // Restaurar posición original (centrado)
    terminal.style.top = "40%";
    terminal.style.left = "50%";
    terminal.style.transform = "translate(-50%, -50%)";

    setTimeout(() => {
        terminal.style.transition = "none";
    }, 1000);
}

function dragPingForm(event) {

    event.preventDefault();
    document.body.style.cursor = "move";
    const pingform = event.target.closest(".ping-form");
    let rect = pingform.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;
    pingform.style.right = 'auto';
    pingform.style.left = `${rect.left}px`;
    pingform.style.top = `${rect.top}px`;

    function movePingForm(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - pingform.offsetWidth;
        let maxY = window.innerHeight - pingform.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        pingform.style.left = `${x}px`;
        pingform.style.top = `${y}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', movePingForm);
        document.removeEventListener('mouseup', stopDragging);
        document.body.style.cursor = "default";
    }

    document.addEventListener('mousemove', movePingForm);
    document.addEventListener('mouseup', stopDragging);
}

function addPacketTraffic(packet) {
    const $table = document.querySelector(".packet-traffic table");
    let transportProtocol = packet.transport_protocol || "N/A";
    let protocol = packet.protocol || "N/A";
    let type = packet.type;
    let destinationIP = packet.destination_ip;
    let originIP = packet.origin_ip;
    let destinationMAC = packet.destination_mac;
    let originMAC = packet.origin_mac;
    //let destinationPort = packet.port || "N/A";
    //let giaddress = packet.giaddr || "N/A";
    //let yiaddress = packet.yiaddr || "N/A";
    //let ciaddress = packet.ciaddr || "N/A";
    //let siaddress = packet.siaddr || "N/A";
    //let chaddress = packet.chaddr || "N/A";
    let sequenceNumber = packet.sequence_number || "N/A";
    let ackNumber = packet.ack_number || "N/A";

    $table.innerHTML += `
        <tr>
            <td>${transportProtocol}</td>
            <td>${protocol}</td>
            <td>${type}</td>
            <td>${originIP}</td>
            <td>${destinationIP}</td>
            <td>${originMAC}</td>
            <td>${destinationMAC}</td>
            <td>${sequenceNumber}</td>
            <td>${ackNumber}</td>
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
        let ciaddr = $tds[7].innerHTML;
        let giaddr = $tds[8].innerHTML;
        let siaddr = $tds[9].innerHTML;
        let yiaddr = $tds[10].innerHTML;
        let chaddr = $tds[11].innerHTML;

        if (protocol.includes(filter) || type.includes(filter) || originIP.includes(filter) || destinationIP.includes(filter) || originMAC.includes(filter) || destinationMAC.includes(filter) || destinationPort.includes(filter) || ciaddr.includes(filter) || giaddr.includes(filter) || siaddr.includes(filter) || yiaddr.includes(filter) || chaddr.includes(filter)) {
            $tr.style.display = "table-row";
        } else {
            $tr.style.display = "none";
        }
    }

}
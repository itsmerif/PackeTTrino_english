function createPcObject(x, y) {
    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");

    //caracteristicas generales
    networkObject.id = `pc-${itemIndex}`;
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.classList.add("item-dropped", "pc");
    networkObject.setAttribute("data-ip", "");
    networkObject.setAttribute("data-netmask", "");
    networkObject.setAttribute("data-network", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");
    networkObject.setAttribute("data-dhcp", false);

    //contenido
    networkObject.innerHTML = `
        <img src="./assets/board/pc.png" alt="pc" draggable="true">
        <article class="arp-table" onclick="event.stopPropagation()">
            <table>
                <tr>
                    <th>IP Address</th>
                    <th>MAC Address</th>
                </tr>
            </table>
            <button onclick="closeARPTable(event)">Cerrar</button>
        </article>
        <div class="advanced-options-modal">
            <button onclick="showTerminal(event)">Modo Terminal</button>
            <button onclick="showARPTable(event)">Ver Tabla ARP</button>
            <button onclick="deleteItem(event)">Eliminar</button>
        </div>
        <div class="quick-info" style="display: none;">
            <span class="ip">255.255.255.255/16</span>
        </div>
    `;

    //eventos
    networkObject.setAttribute("onclick", "showPcForm('" + networkObject.id + "')");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    //networkObject.setAttribute("onmouseover", "showquickInfo(event)");
    //networkObject.setAttribute("onmouseout", "hidequickInfo(event)");
    board.appendChild(networkObject);
    itemIndex++;
}

function showPcForm(id) {
    const networkObject = document.getElementById(id);
    const ip = networkObject.getAttribute("data-ip");
    const netmask = networkObject.getAttribute("data-netmask");
    const gateway = networkObject.getAttribute("data-gateway");
    const dhcp = networkObject.getAttribute("data-dhcp");
    document.querySelector(".pc-form #ip").value = ip;
    document.getElementById("form-item-id").innerHTML = id;
    document.querySelector(".pc-form #netmask").value = netmask;
    document.querySelector(".pc-form #gateway").value = gateway;

    if (dhcp === "true") {
        document.querySelector(".pc-form #dhcp").checked = true;
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = true);
    } else {
        document.querySelector(".pc-form #dhcp").checked = false;
    }

    document.querySelector(".pc-form").style.display = "flex";
}

function savePcSpecs(event) {
    event.preventDefault();
    const networkObject = document.getElementById(document.getElementById("form-item-id").innerHTML);
    const newIp = document.querySelector(".pc-form #ip").value;
    const newNetmask = document.querySelector(".pc-form #netmask").value;
    const newGateway = document.querySelector(".pc-form #gateway").value;
    const newDhcp = document.querySelector(".pc-form #dhcp").checked;
    networkObject.setAttribute("data-ip", newIp);
    networkObject.setAttribute("data-netmask", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-network", getNetwork(newIp, newNetmask));
    networkObject.setAttribute("data-dhcp", newDhcp);
    document.querySelector(".pc-form").style.display = "none";
}

function showAdvancedOptions(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
}

function showARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
    table.style.display = "flex";
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".arp-table");
    table.style.display = "none";
}

function disableOptionsPcForm(event) {
    const input = event.target;
    if (input.checked) {
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = true);
    } else {
        document.querySelector(".pc-form").querySelectorAll("input[type='text']").forEach(input => input.disabled = false);
    }
}

function showquickInfo(event) {
    event.preventDefault();
    clearTimeout(quickInfoTimeout);
    quickInfoTimeout = setTimeout(() => {
        const quickInfo = document.querySelector(".quick-info");
        const networkObject = event.target.closest(".item-dropped");
        quickInfo.querySelector(".ip").innerHTML = networkObject.getAttribute("data-ip");
        quickInfo.style.display = "block";
    }, 200);
}

function hidequickInfo(event) {
    event.preventDefault();    
    clearTimeout(quickInfoTimeout);
    const quickInfo = document.querySelector(".quick-info");
    quickInfo.style.display = "none";
}

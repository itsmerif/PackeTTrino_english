function createPcObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");

    networkObject.id = `pc-${itemIndex}`;
    networkObject.classList.add("item-dropped", "pc");
    networkObject.setAttribute("data-ip", "");
    networkObject.setAttribute("data-netmask", "");
    networkObject.setAttribute("data-network", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");

    networkObject.innerHTML = `
        <img src="./assets/pc.png" alt="pc" draggable="true">
        <article class="mac-table" onclick="event.stopPropagation()">
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
        </div>
    `;

    networkObject.addEventListener("click", () => showPcForm(networkObject.id));
    networkObject.addEventListener("contextmenu", event => showAdvancedOptions(event));
    networkObject.addEventListener("dragstart", event => BoardItemDragStart(event));

    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    
    board.appendChild(networkObject);
    itemIndex++;
}

function BoardItemDragStart(event) {

    const networkObject = event.target.closest(".item-dropped");
    
    //obtengo TODOS los datos del elemento

    const networkObjectid = networkObject.id;
    const ip = networkObject.getAttribute("data-ip");
    const netmask = networkObject.getAttribute("data-netmask");
    const network = networkObject.getAttribute("data-network");
    const mac = networkObject.getAttribute("data-mac");
    const gateway = networkObject.getAttribute("data-gateway");
    const itemType = "item-dropped";
    const x = networkObject.style.left;   
    const y = networkObject.style.top;
    
    //los transformamos en un string

    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectid,
        ip: ip,
        netmask: netmask,
        network: network,
        mac: mac,
        gateway: gateway,
        originx: x,
        originy: y
    }));

    console.log(x,y,ip,netmask,network,mac,gateway);
}

function showPcForm(id) {
    const networkObject = document.getElementById(id);
    const ip = networkObject.getAttribute("data-ip");
    const netmask = networkObject.getAttribute("data-netmask");
    const gateway = networkObject.getAttribute("data-gateway");
    document.querySelector(".pc-form #ip").value = ip;
    document.getElementById("form-item-id").innerHTML = id;
    document.querySelector(".pc-form #netmask").value = netmask;
    document.querySelector(".pc-form #gateway").value = gateway; 
    document.querySelector(".pc-form").style.display = "flex";
}

function savePcSpecs(event) {
    event.preventDefault();
    const networkObject = document.getElementById(document.getElementById("form-item-id").innerHTML);
    const newIp = document.querySelector(".pc-form #ip").value;
    const newNetmask = document.querySelector(".pc-form #netmask").value;
    const newGateway = document.querySelector(".pc-form #gateway").value;
    networkObject.setAttribute("data-ip", newIp);
    networkObject.setAttribute("data-netmask", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-network", getNetwork(newIp, newNetmask));
    document.querySelector(".pc-form").style.display = "none";
}

function showAdvancedOptions(event) {
    event.preventDefault();
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped")
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "flex";
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

function showARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
    table.style.display = "flex";
}

function closeARPTable(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const table = networkObject.querySelector(".mac-table");
    table.style.display = "none";
}
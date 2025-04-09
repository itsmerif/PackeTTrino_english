function createDhcpRelayObject(x, y) {

    const board = document.querySelector(".board");
    const networkObject = document.createElement("article");
    const networkObjectIcon = document.createElement("img");
    const advancedOptions = document.createElement("div");
    const networkObjectArpTable = document.createElement("article");
    const firewallTable = document.createElement("article");


    //caracteristicas generales

    networkObject.id = `dhcp-relay-server-${itemIndex}`;
    networkObject.classList.add("item-dropped", "dhcp-relay");
    [x,y] = checkObjectClip(x, y);
    networkObject.style.left = `${x}px`;
    networkObject.style.top = `${y}px`;
    networkObject.setAttribute("ip-enp0s3", "");
    networkObject.setAttribute("netmask-enp0s3", "");
    networkObject.setAttribute("data-mac", getRandomMac());
    networkObject.setAttribute("data-gateway", "");
    networkObject.setAttribute("data-switch", "");
    networkObject.setAttribute("firewall-default-policy", "ACCEPT");

    //servicios

    networkObject.setAttribute("dhcrelay", "true");

    //atributos de servicios

    networkObject.setAttribute("data-main-server", "");

    //icono

    networkObjectIcon.src = "./assets/board/dhcprelay.svg";
    networkObjectIcon.alt = "server";
    networkObjectIcon.draggable = true;
    networkObject.appendChild(networkObjectIcon);

    //opciones avanzadas

    advancedOptions.classList.add("advanced-options-modal");
    advancedOptions.innerHTML = `
        <button onclick="showTerminal(event)">Modo Terminal</button>
        <button onclick="showARPTable(event)">Ver Tabla ARP</button>
        <button onclick="deleteItem(event)">Eliminar</button>
    `;

    networkObject.appendChild(advancedOptions);

    //tabla de arp

    networkObjectArpTable.classList.add("arp-table");
    networkObjectArpTable.innerHTML = `
        <table>
            <tr>
                <th>IP Address</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeARPTable(event)">Cerrar</button>`;
    
    networkObject.appendChild(networkObjectArpTable);

    //tabla de firewall

    firewallTable.classList.add("firewall-table");
    firewallTable.innerHTML = `
            <table>
                <tr>
                    <th>Id</th>
                    <th>Chain</th>
                    <th>Protocol</th>
                    <th>Origin IP</th>
                    <th>Destination IP</th>
                    <th>Port</th>
                    <th>Action</th>
                </tr>
            </table>`;

    networkObject.appendChild(firewallTable);
    
    //eventos

    networkObject.setAttribute("ondragstart", "BoardItemDragStart(event)");
    networkObject.setAttribute("oncontextmenu", "showAdvancedOptions(event)");
    networkObject.setAttribute("onclick", "showDhcpRelaySpecs(event)");
    advancedOptions.setAttribute("onclick", "event.stopPropagation()");

    board.appendChild(networkObject);
    itemIndex++;

}

function showDhcpRelaySpecs(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(networkObject.id);
        return;
    }
    
    //obtenemos los atributos del servidor
    const ip = networkObject.getAttribute("ip-enp0s3");
    const netmask = networkObject.getAttribute("netmask-enp0s3");
    const gateway = networkObject.getAttribute("data-gateway");
    const mainServer = networkObject.getAttribute("data-main-server");
    //mostramos el formulario
    document.querySelector(".dhcp-relay-form #ip-relay").value = ip;
    document.querySelector(".dhcp-relay-form #netmask-relay").value = netmask;
    document.querySelector(".dhcp-relay-form #gateway-relay").value = gateway;
    document.querySelector(".dhcp-relay-form #main-server").value = mainServer;
    document.getElementById("form-dhcp-relay-item-id").innerHTML = networkObject.id;
    document.querySelector(".dhcp-relay-form").style.display = "flex";
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
}

function saveDhcpRelaySpecs(event) {
    event.preventDefault();
    //obtenemos los valores del formulario  
    const newIp = document.querySelector(".dhcp-relay-form #ip-relay").value;
    const newNetmask = document.querySelector(".dhcp-relay-form #netmask-relay").value;
    const newGateway = document.querySelector(".dhcp-relay-form #gateway-relay").value;
    const newMainServer = document.querySelector(".dhcp-relay-form #main-server").value;
    //guardamos los nuevos atributos en el server
    const networkObject = document.getElementById(document.getElementById("form-dhcp-relay-item-id").innerHTML);
    networkObject.setAttribute("ip-enp0s3", newIp);
    networkObject.setAttribute("netmask-enp0s3", newNetmask);
    networkObject.setAttribute("data-gateway", newGateway);
    networkObject.setAttribute("data-main-server", newMainServer);
    //ocultamos el formulario
    document.querySelector(".dhcp-relay-form").style.display = "none";  
}
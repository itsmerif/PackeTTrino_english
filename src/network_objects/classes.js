class PcObject {

    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.ip = "";
        this.netmask = "";
        this.network = "";
        this.mac = getRandomMac();
        this.gateway = "";
        this.switch = "";
        this.dhcp = false;
        this.element = this.createElement();
        itemIndex++;
    }

    createElement() {

        const networkObject = document.createElement("article");

        networkObject.id = this.id;
        networkObject.classList.add("item-dropped", "pc");
        networkObject.style.left = `${this.x}px`;
        networkObject.style.top = `${this.y}px`;

        // Atributos de datos

        networkObject.dataset.ip = this.ip;
        networkObject.dataset.netmask = this.netmask;
        networkObject.dataset.network = this.network;
        networkObject.dataset.mac = this.mac;
        networkObject.dataset.gateway = this.gateway;
        networkObject.dataset.switch = this.switch;
        networkObject.dataset.dhcp = this.dhcp;

        // Contenido HTML

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

        // Eventos

        networkObject.onclick = () => showPcForm(this.id);
        networkObject.oncontextmenu = (event) => showAdvancedOptions(event);
        networkObject.ondragstart = (event) => BoardItemDragStart(event);
        return networkObject;
    }

    setIp(ip) {
        this.ip = ip;
        this.element.dataset.ip = ip;
    }

    setNetmask(netmask) {
        this.netmask = netmask;
        this.element.dataset.netmask = netmask;
    }

    setNetwork(network) {
        this.network = network;
        this.element.dataset.network = network;
    }

    setGateway(gateway) {
        this.gateway = gateway;
        this.element.dataset.gateway = gateway;
    }

    render(parent) {
        parent.appendChild(this.element);
    }

}
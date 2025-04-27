function firewallTable() {

    const $firewallTable = document.createElement("article");

    $firewallTable.classList.add("modal-table","firewall-table");

    $firewallTable.innerHTML = `
        <table>
            <tr>
                <th>Id</th>
                <th>Cadena</th>
                <th>Protocolo</th>
                <th>Ip de Origen</th>
                <th>Ip de Destino</th>
                <th>Puerto de Origen</th>
                <th>Puerto de Destino</th>
                <th>Acción</th>
            </tr>
        </table>

        <button onclick="closeObjectModalTable(event, '.firewall-table')">Cerrar</button>
    `;

    $firewallTable.addEventListener("click", (event) => event.stopPropagation());
    return $firewallTable;
    
}
function firewallTable() {

    const $firewallTable = document.createElement("article");

    $firewallTable.classList.add("firewall-table");

    $firewallTable.innerHTML = `
        <table>
            <tr>
                <th>Id</th>
                <th>Cadena</th>
                <th>Protocolo</th>
                <th>Ip de Origen</th>
                <th>Ip de Destino</th>
                <th>Puerto</th>
                <th>Acción</th>
            </tr>
        </table>

        <button onclick="closeObjectModalTable(event, '.firewall-table')">Cerrar</button>
    `;

    return $firewallTable;
    
}
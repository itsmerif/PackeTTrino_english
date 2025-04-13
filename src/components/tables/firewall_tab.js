function firewallTable() {

    const $firewallTable = document.createElement("article");

    $firewallTable.classList.add("firewall-table");

    $firewallTable.innerHTML = `
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
        </table>

        <button onclick="closeObjectModalTable(event, '.firewall-table')">Cerrar</button>
    `;

    return $firewallTable;
    
}
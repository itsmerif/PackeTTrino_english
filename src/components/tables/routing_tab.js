function routingTable() {
    const $routingTable = document.createElement("article");

    $routingTable.classList.add("routing-table");

    $routingTable.innerHTML = `
        <table>
            <tr>
                <th>Destination</th>
                <th>Netmask</th>
                <th>Gateway</th>
                <th>Interface</th>
                <th>Next Hop</th>
            </tr>
            <tr id="default-route">
                <td>0.0.0.0</td>
                <td>0.0.0.0</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.routing-table')">Cerrar</button>
    `;

    $routingTable.setAttribute("onclick", "event.stopPropagation()");

    return $routingTable;
}
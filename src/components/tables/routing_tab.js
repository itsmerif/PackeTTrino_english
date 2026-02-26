function routingTable() {
    const $routingTable = document.createElement("article");

    $routingTable.classList.add("modal-table","routing-table");

    $routingTable.innerHTML = `
        <table>
            <tr>
                <th>Destination Network</th>
                <th>Network Mask</th>
                <th>Output</th>
                <th>Interface</th>
                <th>Next Hop</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.routing-table')">Close</button>
    `;

    $routingTable.setAttribute("onclick", "event.stopPropagation()");

    return $routingTable;
}

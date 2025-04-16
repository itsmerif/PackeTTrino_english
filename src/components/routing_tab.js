function routingTable() {
    const $routingTable = document.createElement("article");

    $routingTable.classList.add("routing-table");

    $routingTable.innerHTML = `
        <table>
            <tr>
                <th>Red de Destino</th>
                <th>Máscara de Red</th>
                <th>Salida</th>
                <th>Interfaz</th>
                <th>Siguiente Salto</th>
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
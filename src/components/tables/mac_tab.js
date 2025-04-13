function macTable() {

    const $macTable = document.createElement("article");

    $macTable.classList.add("mac-table");

    $macTable.innerHTML = `
        <table>
            <tr>
                <th>Device</th>
                <th>MAC Address</th>
            </tr>
        </table>
        <button onclick="closeMacTable(event)">Cerrar</button>
    `;

    $macTable.setAttribute("onclick", "event.stopPropagation()");

    return $macTable;
    
}
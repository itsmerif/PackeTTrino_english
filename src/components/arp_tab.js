function arpTable() {

    const $arpTable = document.createElement("article");

    $arpTable.classList.add("arp-table");

    $arpTable.innerHTML = `
        <table>
            <tr>
                <th>IP</th>
                <th>MAC</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.arp-table')">Cerrar</button>
    `;

    $arpTable.setAttribute("onclick", "event.stopPropagation();");

    return $arpTable;
    
}
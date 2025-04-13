function cacheDnsTable() {

    const $cacheDnsTable = document.createElement("article");

    $cacheDnsTable.classList.add("cache-dns-table");

    $cacheDnsTable.innerHTML = `
        <table>
            <tr>
                <th>Domain</th>
                <th>Type</th>
                <th>Value</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.cache-dns-table')">Cerrar</button>
    `;

    $cacheDnsTable.setAttribute("onclick", "event.stopPropagation();");

    return $cacheDnsTable;
    
}
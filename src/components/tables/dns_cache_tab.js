function cacheDnsTable() {

    const $cacheDnsTable = document.createElement("article");

    $cacheDnsTable.classList.add("modal-table","cache-dns-table");

    $cacheDnsTable.innerHTML = `
        <table>
            <tr>
                <th>Domain</th>
                <th>Record Type</th>
                <th>Value</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.cache-dns-table')">Close</button>
    `;

    $cacheDnsTable.setAttribute("onclick", "event.stopPropagation();");

    return $cacheDnsTable;
    
}

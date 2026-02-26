function dnsTable() {
    
    const $dnsTable = document.createElement("article");

    $dnsTable.classList.add("modal-table","dns-table");
    $dnsTable.innerHTML = `
                <table>
                    <tr>
                        <th>Domain</th>
                        <th>Record Type</th>
                        <th>Value</th>
                    </tr>
                </table>
                <button onclick="closeObjectModalTable(event, '.dns-table')">Cerrar</button>`;


    $dnsTable.setAttribute("onclick", "event.stopPropagation()");

    return $dnsTable;

}

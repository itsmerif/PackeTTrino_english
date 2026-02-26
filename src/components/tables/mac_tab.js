function macTable() {

    const $macTable = document.createElement("article");

    $macTable.classList.add("modal-table","mac-table");

    $macTable.innerHTML = `
        <table>
            <tr>
                <th>Device</th>
                <th>MAC</th>
                <th>Physical Port</th>
            </tr>
        </table>
        <button onclick="closeMacTable(event)">Close</button>
    `;

    $macTable.setAttribute("onclick", "event.stopPropagation()");

    return $macTable;
    
}

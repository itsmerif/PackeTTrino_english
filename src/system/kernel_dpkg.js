function dpkg(networkObjectId, option, package) {
    
    const managerFunctions = {
        "apache2": () => manageApache(networkObjectId, option),
        "bind9": () => manageBind(networkObjectId, option),
        "isc-dhcp-server": () => manageDhcpd(networkObjectId, option),
        "isc-dhcp-relay": () => manageDhcprelay(networkObjectId, option),
        "isc-dhcp-client": () => manageDhclient(networkObjectId, option),
    }

    managerFunctions[package]();
}


function manageApache(networkObjectId, option) {

    const $networkObject = document.getElementById(networkObjectId);
    const isApacheInstalled = $networkObject.getAttribute("apache") !== null;

    if (option === "install") {

        if (isApacheInstalled) {
            terminalMessage("Error: El paquete Apache ya está instalado.");
            return;
        }

        terminalMessage("Instalando Apache...");
        $networkObject.setAttribute("apache", "true");
        $networkObject.setAttribute("web-content", "");
        terminalMessage("Apache instalado correctamente.");

    }

    if (option === "remove") {

        if (!isApacheInstalled) {
            terminalMessage("Error: El paquete Apache no está instalado.");
            return;
        }

        terminalMessage("Desinstalando Apache...");
        $networkObject.removeAttribute("apache");
        $networkObject.removeAttribute("web-content");
        terminalMessage("Apache desinstalado correctamente.");

    }

    command_systemctl(networkObjectId, ["systemctl", "status", "apache"]);

}


function manageBind(networkObjectId, option) {

    const $networkObject = document.getElementById(networkObjectId);
    const isBindInstalled = $networkObject.getAttribute("named") !== null;

    if (option === "install") {

        if (isBindInstalled) {
            terminalMessage("Error: El paquete Bind ya está instalado.");
            return;
        }

        installBind9(networkObjectId);
    }

    if (option === "remove") {

        if (!isBindInstalled) {
            terminalMessage("Error: El paquete Bind no está instalado.");
            return;
        }

        terminalMessage("Desinstalando Bind...");
        $networkObject.removeAttribute("bind");
        terminalMessage("Bind desinstalado correctamente.");

    }

    command_systemctl(networkObjectId, ["systemctl", "status", "named"]);

}

function installBind9(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const $advancedOptions = $networkObject.querySelector(".advanced-options-modal");
    const $networkObjectDnsTable = document.createElement("article");

    terminalMessage("Instalando Bind...");

    $networkObject.setAttribute("named", "true");
    $networkObject.setAttribute("recursion", "false");
    $advancedOptions.innerHTML += `<button onclick="showObjectModalTable(event, '.dns-table')">Ver Registros DNS</button>`;
    $networkObjectDnsTable.classList.add("dns-table");
    $networkObjectDnsTable.innerHTML = `
        <table>
            <tr>
                <th>Domain</th>
                <th>Type</th>
                <th>Value</th>
            </tr>
        </table>
        <button onclick="closeObjectModalTable(event, '.dns-table')">Cerrar</button>
    `;

    $networkObject.appendChild($networkObjectDnsTable);

    terminalMessage("Bind instalado correctamente.");

}
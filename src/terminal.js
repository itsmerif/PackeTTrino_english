function sendCommand(event) {

    const terminal = event.target.closest('.pc-terminal');
    const dataId = terminal.dataset.id;
    const originIP = document.getElementById(dataId).getAttribute("data-ip");

    if (event.key === "Enter") {

        window.clearInterval(window.pingInterval); //limpiamos todos los pings en funcionamiento
        document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
        const input = event.target.value.trim(); //obtenemos la entrada eliminando los espacios en blanco
        const args = input.split(" "); //dividimos la entrada en argumentos separados por espacios
        const command = args[0]; //el primer argumento es el comando

        let newoutput = "";

        switch (command) {

            case "ping":
                const destinationIP = args[1] || "0.0.0.0";
                newoutput = ping(originIP, destinationIP);
                break;
            case "ipconfig":
                newoutput = ipconfig(dataId);
                document.querySelector(".terminal-output").innerHTML = newoutput;
                break;
            case "arp":
                newoutput = getARPTable(dataId);
                break;
            case "exit":
                event.target.value = "";
                document.querySelector(".pc-terminal").style.display = "none";
                break;
            case "ip":
                newoutput = checkIpRouting(dataId, args);
                document.querySelector(".terminal-output").innerHTML = newoutput;
                break;
            default:
                newoutput = "Command not found";
                document.querySelector(".terminal-output").innerHTML = newoutput;
                break;
        }
    }
}

function clickTerminal(event) {
    const terminal = event.target.closest(".pc-terminal");
    const input = terminal.querySelector("input");
    input.focus();
}


function checkIpRouting(id, args) {

    //sintaxis del comando: ip route <add|del> <destination> <netmask> via <nexthop>
    //                      0    1       2           3           4      5     6

    if (args.length < 7) {
        return 'Error de argumentos. Sintaxis: ip route [add|del] [destination] [netmask] via [nexthop]';
    }

    if (args[1] !== "route" || args[2] !== "add" && args[2] !== "del" || args[5] !== "via") {
        return 'Error de argumentos. Sintaxis: ip route [add|del] [destination] [netmask] via [nexthop]';
    }

    addRoutingEntry(id, args[3], args[4], args[6]);

    return "Comando ip route ejecutado correctamente";

}

function addRoutingEntry(id, destination, netmask, nexthop) {

    const networkObject = document.getElementById(id);
    const table = networkObject.querySelector("table");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <tr>
            <td>${destination}</td>
            <td>${netmask}</td>
            <td>${nexthop}</td>
        </tr>`;
    table.appendChild(newRow);

}
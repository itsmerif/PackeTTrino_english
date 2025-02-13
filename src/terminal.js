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
                newoutput = ping(originIP, destinationIP, false, dataId);
                break;
            case "arp":
                newoutput = getARPTable(dataId);
                break;
            case "exit":
                event.target.value = "";
                document.querySelector(".pc-terminal").style.display = "none";
                break;
            case "ip":
                command_Ip(dataId, args);
                break;
            case "dhcp":
                checkDhcp(dataId, args);
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

function command_Ip(id, args) {

    if (args[1] === "a") { //mostramos la informacion del equipo, solo puede ser ejecutado desde un pc
        
        if (id.includes("router-")) {
            return "Error: Este comando solo puede ser ejecutado desde un pc.";
        }

        const pc = document.getElementById(id);
        const ip = pc.getAttribute("data-ip");
        const netmask = pc.getAttribute("data-netmask");
        const gateway = pc.getAttribute("data-gateway");
        const mac = pc.getAttribute("data-mac");
        
        terminalMessage(`Dirección IP: ${ip}
        Puerta de Enlace: ${gateway}
        Máscara de Red: ${netmask}
        Dirección Física: ${mac}`);

        return;
    }

    if (args[1] === "route") { //añadir reglas de enrutamiento, solo puede ser ejecutado desde un router

        if (!id.includes("router-")) {
            terminalMessage('Error: Este comando solo puede ser ejecutado desde un router.');
            return;
        }

        if (args.length < 8) {
            terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');
            return;
        }

        if (args[2] !== "add" && args[2] !== "del" || args[5] !== "via") {
            terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');
            return;
        }

        if (args[2] === "add") {
            addRoutingEntry(id, args[3], args[4], args[6], args[7]);
        }

        if (args[2] === "del") {
            removeRoutingEntry(id, args[3], args[4], args[6], args[7]);
        }

        terminalMessage('Comando ip route ejecutado correctamente');

    }

    terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');

}

function dragTerminal(event) {

    event.preventDefault();
    const terminal = event.target.closest(".pc-terminal");
    let rect = terminal.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;

    terminal.style.left = `${rect.left}px`;
    terminal.style.top = `${rect.top}px`;
    terminal.style.transform = 'none';
    terminal.style.position = 'fixed';

    function moveTerminal(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - terminal.offsetWidth;
        let maxY = window.innerHeight - terminal.offsetHeight;
        terminal.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        terminal.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', moveTerminal);
        document.removeEventListener('mouseup', stopDragging);
        const input = terminal.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveTerminal);
    document.addEventListener('mouseup', stopDragging);

}

function terminalMessage(message) {

    const terminal = document.querySelector(".pc-terminal");
    const output = document.querySelector(".terminal-output");
    output.innerHTML += `<p class="terminal-message">${message}</p>`;
    terminal.scrollTop = output.scrollHeight;

}

async function checkDhcp(dataId, args) {

    //ya sé que el primer argumento es dhcp

    if (args.length > 3 || args.length < 2) {
        terminalMessage("Error: Sintaxis: dhcp [ -release | -renew ] [ -visual ]");
        return;
    }

    if (args[1] === "-release") { //llamada al protocolo de liberación de ip
        releaseDhcp(dataId);
        return;
    }

    if (args[1] === "-renew" && args[2] === "-visual") {
        minimizeTerminal();
        await waitForMove();
        await dhcp(dataId, true);
        maximizeTerminal();
        return;
    }

    if (args[1] === "-renew" && args.length === 2) {
        dhcp(dataId, false);
        return;
    }

    terminalMessage("Error: Sintaxis: dhcp [ -release | -renew ] [ -visual ]");
} 
let terminalBuffer = [];
let currentCommandIndex = 0;

function sendCommand(event) {

    const terminal = event.target.closest('.terminal-component');
    const dataId = terminal.dataset.id;
    const originIP = document.getElementById(dataId).getAttribute("data-ip");

    if (event.key === "Enter") {

        window.clearInterval(window.pingInterval); //limpiamos todos los pings en funcionamiento
        document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
        const input = event.target.value.trim(); //obtenemos la entrada eliminando los espacios en blanco
        terminalBuffer.push(input); //añadimos el comando en el buffer
        currentCommandIndex++; //actualizamos el indice del cursos de comandos
        document.querySelector(".terminal-component").querySelector("input").value = ""; //limpiamos la entrada
        const args = input.split(" "); //dividimos la entrada en argumentos separados por espacios
        const command = args[0]; //el primer argumento es el comando

        let newoutput = "";

        switch (command) {
            case "ping":
                command_ping(dataId, args);
                break;
            case "dhcp":
                dhcp(dataId, args);
                break;
            case "iptables":
                iptables(dataId, args);
                break;
            case "ip":
                command_Ip(dataId, args, originIP);
                break;
            case "dns":
                command_dns(dataId, args);
                break;
            case "dig":
                command_dig(dataId, args);
                break;
            case "tcp":
                command_tcp(dataId, args);
                break;
            case "http":
                command_http(dataId, args);
                break;
            case "arp":
                command_arp(dataId, args);
                break;
            case "apache":
                command_apache(dataId, args);
                break;
            case "nano":
                command_nano(dataId, args);
                break;
            case "help":
                command_help();
                break;
            case "man":
                command_man(args[1]);
                break;
            case "visual":
                command_visual(args);
                break;
            case "test":
                command_test(args);
                break;
            case "traceroute":
                command_traceroute(dataId, args);
                break;
            case "exit":
                event.target.value = "";
                document.querySelector(".terminal-component").style.display = "none";
                terminalBuffer = [];
                currentCommandIndex = 0;
                break;
            default:
                newoutput = "Command not found";
                document.querySelector(".terminal-output").innerHTML = newoutput;
                break;
        }

    }
}

function clickTerminal(event) {
    const terminal = event.target.closest(".terminal-component");
    const input = terminal.querySelector("input");
    input.focus();
}

function dragTerminal(event) {

    event.preventDefault();
    const terminal = event.target.closest(".terminal-component");
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
        document.body.style.cursor = "grabbing";
    }

    function stopDragging() {
        document.body.style.cursor = "default";
        document.removeEventListener('mousemove', moveTerminal);
        document.removeEventListener('mouseup', stopDragging);
        const input = terminal.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveTerminal);
    document.addEventListener('mouseup', stopDragging);

}

function terminalMessage(message) {
    const terminal = document.querySelector(".terminal-component");
    if (terminal.style.display === "none") return;
    const output = document.querySelector(".terminal-output");
    const messageElement = document.createElement("p");
    messageElement.className = "terminal-message";
    messageElement.innerHTML = message;
    output.appendChild(messageElement);
    //terminal.scrollTop = output.scrollHeight;
}

function terminalKeyboard(event) {

    if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        document.querySelector(".terminal-output").innerHTML = "";
    }

    if (event.key === "Escape") {
        closeTerminal(event);
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentCommandIndex === 0) return;
        currentCommandIndex--;
        document.querySelector(".terminal-component").querySelector("input").value = terminalBuffer[currentCommandIndex];
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (currentCommandIndex === terminalBuffer.length) return;
        currentCommandIndex++;
        document.querySelector(".terminal-component").querySelector("input").value = terminalBuffer[currentCommandIndex] || "";
    }
}

function getRoutingRules(routerObjectid, targetinterface) {

    const $routerObject = document.getElementById(routerObjectid);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");
    const rules = [];

    for (let i = 4; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let destination = cells[0].innerHTML.trim();
        let netmask = cells[1].innerHTML.trim();
        let interface = cells[3].innerHTML.trim();
        let nextHop = cells[4].innerHTML.trim();

        if (interface === targetinterface && nextHop !== "0.0.0.0") {
            rules.push(`ip route add ${destination}/${netmaskToCidr(netmask)} via ${nextHop}`);
        }
    }

    return rules;
}

async function minimizeTerminal() {
    return new Promise(resolve => {
        const terminal = document.querySelector(".terminal-component");
        if (!terminal || terminal.style.display === "none") return resolve();
        const rect = terminal.getBoundingClientRect();
        const targetWidth = rect.width * 0.3;
        const targetHeight = rect.height * 0.3;
        const windowHeight = window.innerHeight;
        terminal.style.transition = "all 1s ease-in-out";
        terminal.style.width = `${targetWidth}px`;
        terminal.style.height = `${targetHeight}px`;
        terminal.style.top = `${windowHeight - targetHeight}px`;
        terminal.style.left = "100%";
        terminal.style.transform = "translate(-100%, 0)";
        terminal.addEventListener("transitionend", resolve, { once: true });
    });
}

async function maximizeTerminal() {
    return new Promise(resolve => {
        const terminal = document.querySelector(".terminal-component");
        if (!terminal || terminal.style.display === "none") return resolve();
        terminal.style.transition = "all 1s ease-in-out";
        terminal.style.width = "1000px";
        terminal.style.height = "500px";
        terminal.style.top = "40%";
        terminal.style.left = "50%";
        terminal.style.transform = "translate(-50%, -50%)";
        terminal.addEventListener("transitionend", () => {
            terminal.style.transition = "none";
            resolve();
        }, { once: true });
    });
}

function closeTerminal(event) {
    event.preventDefault();
    const terminal = document.querySelector(".terminal-component");
    clearInterval(window.pingInterval);
    terminalBuffer = [];
    currentCommandIndex = 0;
    terminal.style.display = "none";
    document.querySelector(".terminal-output").innerHTML = "";
    terminal.querySelector("input").value = "";
}


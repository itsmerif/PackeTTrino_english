function terminal() {

    const $terminal = document.createElement("div");
    $terminal.classList.add("terminal-component");
    $terminal.id = "terminal-network";
    $terminal.setAttribute("data-id", "");

    $terminal.innerHTML = `
        <p>
            <span>%></span>
            <input type="text" class="terminal-input" autofocus>
        </p>

        <div class="terminal-output"></div>

        <div class="editor-container" style="display: none;">

        <div class="editor-buttons">
            <p><span>^S</span>Guardar y Salir</p>
        </div>

        <p class="file-editor-error"></p>

        <textarea class="file-editor" data-file=""></textarea>

        <div class="editor-frame"> <span></span> </div>
    `;

    $terminal.addEventListener("keydown", terminalKeyboard);
    $terminal.addEventListener("mousedown", dragTerminal);
    $terminal.addEventListener("click", clickTerminal);
    $terminal.querySelector(".terminal-input").addEventListener("keydown", sendCommand);
    $terminal.querySelector(".terminal-output").addEventListener("click", clickTerminal);
    $terminal.querySelector(".file-editor-error").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor-error").addEventListener("mouseup", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("mouseup", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("click", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("dragstart", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("keydown", fileEditorKeyboard);

    return $terminal;

}

function sendCommand(event) {

    const terminal = event.target.closest('.terminal-component');
    const dataId = terminal.dataset.id;
    const originIP = document.getElementById(dataId).getAttribute("ip-enp0s3");

    if (event.key === "Enter") {

        const input = event.target.value.trim(); //obtenemos la entrada eliminando los espacios en blanco
        const args = input.split(" "); //dividimos la entrada en argumentos separados por espacios
        const command = args[0]; //el primer argumento es el comando

        const commandFunctions = {
            "ping": () => command_ping(dataId, args),
            "dhcp": () => command_Dhcp(dataId, args),
            "iptables": () => command_Iptables(dataId, args),
            "ip": () => command_Ip(dataId, args, originIP),
            "dns": () => command_dns(dataId, args),
            "dig": () => command_dig(dataId, args),
            "arp": () => command_arp(dataId, args),
            "apache": () => command_apache(dataId, args),
            "nano": () => command_nano(dataId, args),
            "help": () => command_help(),
            "man": () => command_man(args[1]),
            "traceroute": () => command_traceroute(dataId, args),
            "systemctl": () => command_systemctl(dataId, args),
            "apt": () => command_Apt(dataId, args),
            "exit": () => closeTerminal(event)
        }

        window.clearInterval(window.pingInterval); //limpiamos todos los procesos de terminal en funcionamiento
        document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
        terminalBuffer.push(input); //añadimos el comando en el buffer
        currentCommandIndex++; //actualizamos el indice del cursor de comandos
        document.querySelector(".terminal-component").querySelector("input").value = ""; //limpiamos la entrada
        commandFunctions[command] ? commandFunctions[command]() : terminalMessage(`Error: comando ${command} desconocido.`, dataId); //ejecutamos la función correspondiente
    }

}

function clickTerminal(event) {
    const terminal = event.target.closest(".terminal-component");
    const input = terminal.querySelector("input");
    input.focus();
}

function dragTerminal(event) {

    event.preventDefault();
    const $terminal = event.target.closest(".terminal-component");
    let rect = $terminal.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;

    $terminal.style.left = `${rect.left}px`;
    $terminal.style.top = `${rect.top}px`;
    $terminal.style.transform = 'none';
    $terminal.style.position = 'fixed';

    function moveTerminal(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - $terminal.offsetWidth;
        let maxY = window.innerHeight - $terminal.offsetHeight;
        $terminal.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        $terminal.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        document.body.style.cursor = "grabbing";
    }

    function stopDragging() {
        document.body.style.cursor = "default";
        document.removeEventListener('mousemove', moveTerminal);
        document.removeEventListener('mouseup', stopDragging);
        const input = $terminal.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveTerminal);
    document.addEventListener('mouseup', stopDragging);

}

function terminalMessage(message, networkObjectId) {
    const $terminal = document.querySelector(".terminal-component");
    const $output = document.querySelector(".terminal-output");
    const $messageElement = document.createElement("p");
    if (window.getComputedStyle($terminal).display === "none") return;
    if ($terminal.dataset.id !== networkObjectId) return;
    $messageElement.className = "terminal-message";
    $messageElement.innerHTML = message;
    $output.appendChild($messageElement);
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
    const $routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");
    const rules = [];

    for (let i = 4; i < $rows.length; i++) {
        let $row = $rows[i];
        let $cells = $row.querySelectorAll("td");
        let destination = $cells[0].innerHTML.trim();
        let netmask = $cells[1].innerHTML.trim();
        let interface = $cells[3].innerHTML.trim();
        let nextHop = $cells[4].innerHTML.trim();
        if (interface === targetinterface && nextHop !== "0.0.0.0") rules.push(`ip route add ${destination}/${netmaskToCidr(netmask)} via ${nextHop}`);
    }

    return rules;
}

async function minimizeTerminal() {
    return new Promise(resolve => {
        const $terminal = document.querySelector(".terminal-component");
        if (!$terminal || window.getComputedStyle($terminal).display === "none") return resolve();
        const rect = $terminal.getBoundingClientRect();
        const targetWidth = rect.width * 0.3;
        const targetHeight = rect.height * 0.3;
        const windowHeight = window.innerHeight;
        $terminal.style.transition = "all 1s ease-in-out";
        $terminal.style.width = `${targetWidth}px`;
        $terminal.style.height = `${targetHeight}px`;
        $terminal.style.top = `${windowHeight - targetHeight}px`;
        $terminal.style.left = "100%";
        $terminal.style.transform = "translate(-100%, 0)";
        $terminal.addEventListener("transitionend", resolve, { once: true });
    });
}

async function maximizeTerminal() {
    return new Promise(resolve => {
        const $terminal = document.querySelector(".terminal-component");
        if (!$terminal || window.getComputedStyle($terminal).display === "none") return resolve();
        $terminal.style.transition = "all 1s ease-in-out";
        $terminal.style.width = "1000px";
        $terminal.style.height = "500px";
        $terminal.style.top = "40%";
        $terminal.style.left = "50%";
        $terminal.style.transform = "translate(-50%, -50%)";
        $terminal.addEventListener("transitionend", () => {
            $terminal.style.transition = "none";
            resolve();
        }, { once: true });
    });
}

function showTerminal(event) {
    event.stopPropagation();
    const networkObject = event.target.closest(".item-dropped");
    const terminal = document.querySelector(".terminal-component");
    terminal.setAttribute("data-id", networkObject.id);
    terminal.style.display = "block";
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
}

function closeTerminal(event) {
    event.preventDefault();
    const $terminal = document.querySelector(".terminal-component");
    clearInterval(window.pingInterval);
    terminalBuffer = [];
    currentCommandIndex = 0;
    document.querySelector(".terminal-output").innerHTML = "";
    $terminal.querySelector("input").value = "";
    $terminal.style.top = "40%";
    $terminal.style.left = "50%";
    $terminal.style.transform = "translate(-50%, -50%)";
    $terminal.style.display = "none";
}

function fileEditorKeyboard(event) {

    event.stopPropagation();

    const textarea = event.target;

    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        closeEditor();
        document.querySelector(".terminal-component").querySelector("input").focus();
    }

    if (event.key === "Tab") {
        event.preventDefault();
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    }

}

function closeEditor() {

    const fileEditor = document.querySelector(".file-editor");
    const fileName = fileEditor.getAttribute("data-file");
    const networkObjectId = document.querySelector(".terminal-component").dataset.id;

    if (fileName === "/etc/network/interfaces") {

        if (networkObjectId.startsWith("router-")) {
            routingTableRestore(document.querySelector(".terminal-component").dataset.id);
        }

        try {

            parserNetworkFile();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }

        return;

    }

    if (fileName === "/etc/resolv.conf") {

        try {

            parserResolvConf();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }
    }

    if (fileName === "/var/www/html/index.html") {
        savewebContent();
        document.querySelector(".editor-container").style.display = "none";
        document.querySelector(".file-editor").value = "";
    }

    if (fileName === "/etc/hosts") {

        try {

            parserEtcHosts();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";
            terminalMessage("El archivo se ha cargado correctamente.");

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }

    }
}
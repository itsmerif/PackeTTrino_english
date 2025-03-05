let terminalBuffer = [];
let currentCommandIndex = 0;

function sendCommand(event) {

    const terminal = event.target.closest('.pc-terminal');
    const dataId = terminal.dataset.id;
    const originIP = document.getElementById(dataId).getAttribute("data-ip");

    if (event.key === "Enter") {

        window.clearInterval(window.pingInterval); //limpiamos todos los pings en funcionamiento
        document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
        const input = event.target.value.trim(); //obtenemos la entrada eliminando los espacios en blanco
        terminalBuffer.push(input); //añadimos el comando en el buffer
        currentCommandIndex++; //actualizamos el indice del cursos de comandos
        document.querySelector(".pc-terminal").querySelector("input").value = ""; //limpiamos la entrada
        const args = input.split(" "); //dividimos la entrada en argumentos separados por espacios
        const command = args[0]; //el primer argumento es el comando

        let newoutput = "";

        switch (command) {
            case "ping":
                ping(dataId, args);
                break;
            case "dhcp":
                dhcp(dataId, args);
                break;
            case "firewall":
                command_firewall(dataId, args);
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
            case "exit":
                event.target.value = "";
                document.querySelector(".pc-terminal").style.display = "none";
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
    const terminal = event.target.closest(".pc-terminal");
    const input = terminal.querySelector("input");
    input.focus();
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
    const messageElement = document.createElement("p");
    messageElement.className = "terminal-message";
    messageElement.innerHTML = message;
    output.appendChild(messageElement);
    terminal.scrollTop = output.scrollHeight;
}

function command_help() {
    terminalMessage("<li>ping: utilidad para enviar paquetes ICMP Echo Request a dispositivos </li>");
    terminalMessage("<li>dhcp: utilidad para configurar DHCP en dispositivos</li>");
    terminalMessage("<li>firewall: utilidad para configurar cortafuegos en dispositivos</li>");
    terminalMessage("<li>arp: utilidad para mostrar/administrar la tabla de direcciones MAC-IP</li>");
    terminalMessage("<li>ip: utilidad para mostrar/administrar la configuracion de red o enrutamiento en dispositivos</li>");
    terminalMessage("<li>dig: utilidad para resolver nombres de dominio</li>");
    terminalMessage("<li>nano: utilidad para editar archivos</li>");
    terminalMessage("<li>help: mostrar ayuda del terminal</li>");
    terminalMessage("<li>exit: salir del terminal</li>");
}

function command_man(topic) {

    switch (topic) {
        case "ping":
            terminalMessage("<p>ping: utilidad de diagnóstico de red para verificar la conectividad entre un dispositivo y otro </p>");
            terminalMessage("<p>Sintaxis: ping &lt;ip|domain&gt;</p>");
            terminalMessage("<p>Ejemplo: ping 8.8.8.8</p>");
            terminalMessage("<p>Ejemplo: ping google.com</p>");
            terminalMessage("<p><span style='color: red;'>Nota:</span> Si se introduce una ip no válida, se intentará resolver como nombre de dominio.</p>");
            break;
        case "dhcp":
            terminalMessage("<p>dhcp: utilidad de descubrimiento de servidor DHCP o de renovación de IP</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p><span style='color: green'>-renew </span>: renovar la IP si se tiene una asignada o descubrir un servidor DHCP</p>");
            terminalMessage("<p><span style='color: green'>-release </span>: liberar la IP si se tiene una asignada </p>");
            terminalMessage("<p><span style='color: red'>Nota </span>: El equipo debe estar configurado como DHCP para que esta utilidad funcione.</p>");
            break;
        case "firewall":
            terminalMessage("<p>firewall: utilidad para configurar el cortafuegos de un dispositivo</p>");
            terminalMessage("<p>Sintaxis: firewall &lt;add|del&gt; -A &lt;chain&gt; -p &lt;protocol&gt; --dport &lt;port&gt; -s &lt;origin&gt; -d &lt;destination&gt; -j &lt;action&gt;</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p> add: añadir una regla al cortafuegos</p>");
            terminalMessage("<p> del: eliminar una regla del cortafuegos</p>");
            terminalMessage("<p> -A &lt;chain&gt;: especificar la cadena del cortafuegos</p>");
            terminalMessage("<p> -p &lt;protocol&gt;: especificar el protocolo</p>");
            terminalMessage("<p> --dport &lt;port&gt;: especificar el puerto. Puede ser cualquiera (*) </p>");
            terminalMessage("<p> -s &lt;origin&gt;: especificar la ip origen. Puede ser cualquiera (*)</p>");
            terminalMessage("<p> -d &lt;destination&gt;: especificar la ip destino. Puede ser cualquiera (*)</p>");
            terminalMessage("<p> -j &lt;action&gt;: especificar la acción</p>");
            terminalMessage("<p>Ejemplo: firewall add -A INPUT -p tcp --dport 80 -s 192.168.1.100 -d 192.168.1.1 -j ACCEPT</p>");
            terminalMessage("<p><span style='color: red'>Nota</span>: Todas las opciones son obligatorias. Usar (*) significa cualquier valor.</p>");
            break;
        case "ip":
            terminalMessage("<p>ip: utilidad para mostrar/administrar la configuración de red o enrutamiento en un dispositivo</p>");
            terminalMessage("<p style='text-decoration: underline;'>Opciones de address:</p>");
            terminalMessage("<p>Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]</p>");
            terminalMessage("<p>addr: mostrar la información del equipo</p>");
            terminalMessage("<p>add: añadir una nueva red a un dispositivo</p>");
            terminalMessage("<p>del: eliminar una red de un dispositivo</p>");
            terminalMessage("<p>Ejemplo: ip addr add 192.168.1.100 255.255.255.0 dev enp0s3</p>");
            terminalMessage("<p style='text-decoration: underline;'>Opciones de route:</p>");
            terminalMessage("<p>Sintaxis: ip route [add|del] [destination] [netmask] via [interface] [nexthop]</p>");
            terminalMessage("<p>route: configurar las reglas de enrutamiento</p>");
            terminalMessage("<p>add: añadir una regla de enrutamiento. Debe ir seguida de una dirección y una máscara de red.</p>");
            terminalMessage("<p>del: eliminar una regla de enrutamiento. Debe ir seguida de una dirección y una máscara de red.</p>");
            terminalMessage("<p>via: especificar la interfaz por la que se va a saltar y el siguiente salto</p>");
            terminalMessage("<p>Ejemplo: ip route add 192.168.1.0 255.255.255.0 via enp0s3 172.16.0.2</p>");
            terminalMessage("<p><span style='color: red'>Nota</span>: La utilidad ip route solo puede ser ejecutada desde un router.</p>");
            break;
        case "dig":
            terminalMessage("<p>dig: utilidad de resolución de nombres de dominio</p>");
            terminalMessage("<p>Sintaxis: dig [@server] &lt;domain&gt;</p>");
            terminalMessage("<p>Ejemplo: dig @8.8.8.8 google.com</p>");
            terminalMessage("<p><span style='color: red'>Nota</span>: Si no se especifica un servidor, se usará el servidor configurado en el equipo.</p>");
            break;
        case "dns":
            terminalMessage("<p>dns: utilidad de configuración de DNS (solo en servidores DNS) </p>");
            terminalMessage("<p>Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p>add: añadir un registro</p>");
            terminalMessage("<p>del: eliminar un registro</p>");
            terminalMessage("<p>-t &lt;type&gt; : especificar el tipo de registro (A, CNAME, NS). Por defecto es A.</p>");
            terminalMessage("<p>Ejemplo: dns add google.com 192.168.1.1</p>");
            terminalMessage("<p>Ejemplo: dns del google.com</p>");
            terminalMessage("<p>Ejemplo: dns add -t CNAME google.com www.google.com</p>");
            break;
        case "arp":
            terminalMessage("<p>arp: utilidad para mostrar/administrar la tabla de direcciones MAC-IP</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p>-n: mostrar la tabla de direcciones MAC-IP</p>");
            terminalMessage("<p>Ejemplo: arp -n</p>");
            break;
        case "help":
            terminalMessage("<p>help: utilidad para mostrar la ayuda del terminal</p>");
            break;
        case "exit":
            terminalMessage("exit: salir del terminal");
            break;
        default:
            terminalMessage("Error: No hay entrada en el manual para esta utilidad.");
            break;
    }
}

function terminalKeyboard(event) {

    if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        document.querySelector(".terminal-output").innerHTML = "";
    }

    if (event.key === "Escape") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        terminalBuffer = [];
        currentCommandIndex = 0;
        document.querySelector(".pc-terminal").style.display = "none";
        document.querySelector(".terminal-output").innerHTML = "";
        document.querySelector(".pc-terminal").querySelector("input").value = "";
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentCommandIndex === 0) return;
        currentCommandIndex--;
        document.querySelector(".pc-terminal").querySelector("input").value = terminalBuffer[currentCommandIndex];
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (currentCommandIndex === terminalBuffer.length) return;
        currentCommandIndex++;
        document.querySelector(".pc-terminal").querySelector("input").value = terminalBuffer[currentCommandIndex] || "";
    }
}

function fileEditorKeyboard(event) {

    event.stopPropagation();
    
    const textarea = event.target;

    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        savewebContent();
        document.querySelector(".editor-container").style.display = "none";
        textarea.value = "";
        document.querySelector(".pc-terminal").querySelector("input").focus();
        return;
    }

    if (event.key === "Tab") {
        event.preventDefault();
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    }

}

function command_nano(dataId, args) {

    const fileName = args[1];
    const networkObjectId = document.querySelector(".pc-terminal").dataset.id;
    const fileEditor = document.querySelector(".file-editor");

    if (!fileName) {
        terminalMessage("Error: El nombre del archivo no puede estar vacío");
        return;
    }

    if (fileName === "/etc/network/interfaces") {
        fileEditor.setAttribute("data-file", "/etc/network/interfaces");
        loadNetworkFile(networkObjectId);
        document.querySelector(".file-editor").focus();
        return;
    }

    if (fileName === "/etc/resolv.conf") {
        fileEditor.setAttribute("data-file", "/etc/resolv.conf");
        loadResolvConf(networkObjectId);
        document.querySelector(".file-editor").focus();
        return;
    }

    if (fileName === "/var/www/html/index.html" || fileName === "-n") {
        fileEditor.setAttribute("data-file", "/var/www/html/index.html");
        loadApacheIndexContent(networkObjectId);
        document.querySelector(".file-editor").focus();
        return;
    }

    terminalMessage("Error: El archivo no existe.");
}

function closeEditor() {

    const fileEditor = document.querySelector(".file-editor");
    const fileName = fileEditor.getAttribute("data-file");
    const networkObjectId = document.querySelector(".pc-terminal").dataset.id;

    if (fileName === "/etc/network/interfaces") {

        if (networkObjectId.startsWith("router-")) {
            routingTableRestore(document.querySelector(".pc-terminal").dataset.id);
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

}

function getRoutingRules(routerObjectid, targetinterface) {

    const $routerObject = document.getElementById(routerObjectid);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");
    const rules = [];

    //ip route add 192.168.1.0/24 via 192.168.1.1

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
        const terminal = document.querySelector(".pc-terminal");
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
        const terminal = document.querySelector(".pc-terminal");
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

function command_visual(args) {

    if (args[1] === "on") {
        visualToggle = true;
        terminalMessage(`<p>Visual mode: ON</p>`);
        return;
    }

    if (args[1] === "off") {
        visualToggle = false;
        terminalMessage(`<p>Visual mode: OFF</p>`);
        return;
    }

    if (args[1] === "speed") {
        visualSpeed = parseInt(args[2], 10);
        terminalMessage(`<p>Visual speed: ${visualSpeed}ms</p>`);
        return;
    }
}

function getopts(options, argString) {

    //obtenemos las opciones y sus valores
    const validOptions = [];
    const optionsValues = {};

    for (let i = 0; i < options.length; i++) {
        if (options[i] !== ":") { //la añadimos como opcion valida
            validOptions.push("-" + options[i]);
            if (options[i+1] === ":") { //esta opcion lleva un valor
                optionsValues["-" + options[i]] = "value";
            } else {
                optionsValues["-" + options[i]] = "novalue";
            }
        }
    }

    const input = argString.split(" ").filter(arg => arg !== ""); //eliminamos los argumentos que estén vacíos
    let output = Object.fromEntries(validOptions.map(validOption => [validOption, "*"])); //inicializamos el objeto de salida
    let i = 1;

    while ( i < input.length) {
        if (validOptions.includes(input[i])) { //es una opcion valida
            if (optionsValues[input[i]] === "value") { //la opcion lleva un valor
                if (!input[i+1] || validOptions.includes(input[i+1])) { //la opcion no lleva un valor o el valor es una opcion valida
                    console.log("Error: sintaxis no valida");
                    return false;
                }
                output[input[i]] = input[i+1];
                i += 2;
            } else { //la opcion no lleva un valor
                output[input[i]] = "novalue";
                i++;
            }
        } else { //no es una opcion valida
            console.log("Error: opcion no valida");
            return false;
        }
    }

    return output;

}
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
            case "sp":
                sp(dataId, args);
                break;
            case "dns":
                command_dns(dataId, args);
                break;
            case "dig":
                command_dig(dataId, args);
                break;
            case "help":
                command_help();
                break;
            case "man":
                command_man(args[1]);
                break;
            case "exit":
                event.target.value = "";
                document.querySelector(".pc-terminal").style.display = "none";
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
    terminalMessage("<li>ping &lt;ip|domain&gt;</li>");
    terminalMessage("<li>dhcp &lt;-renew|-release&gt;</li>");
    terminalMessage("<li>firewall &lt;add|del&gt; -A &lt;chain&gt; -p &lt;protocol&gt; --dport &lt;port&gt; -s &lt;origin&gt; -d &lt;destination&gt; -j &lt;action&gt;</li>");
    terminalMessage("<li>ip &lt;route|a&gt;</li>");
    terminalMessage("<li>dig [@server] &lt;domain&gt;</li>");
    terminalMessage("<li>help</li>");
    terminalMessage("<li>exit</li>");
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
            terminalMessage("<p><span style='color: red'>Nota</span>: La utiliad ip route solo puede ser ejecutada desde un router.</p>");
            break;
        case "dig":
            terminalMessage("<p>dig: utilidad de resolución de nombres de dominio</p>");
            terminalMessage("<p>Sintaxis: dig [@server] &lt;domain&gt;</p>");
            terminalMessage("<p>Ejemplo: dig @8.8.8.8 google.com</p>");
            break;
        case "help":
            terminalMessage("<p>help: utiliad para mostrar la ayuda del terminal</p>");
            break;
        case "exit":
            break;
    }
}
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
            "apt": () => command_apt(dataId, args),
            "mkdir": () => command_mkdir(dataId, args[1]),
            "touch": () => command_touch(dataId, args[1]),
            "rm": () => command_rm(dataId, args[1]),
            "mv": () => command_mv(dataId, args),
            "ls": () => command_ls(dataId, args.slice(1)),
            "cd": () => command_cd(dataId, args[1]),
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
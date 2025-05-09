function unixParser(event) {

    const $terminal = document.querySelector(".terminal-component");
    const networkObjectId = $terminal.dataset.id;

    if (event.key === "Enter") {

        const input = event.target.value.trim(); //obtenemos la entrada eliminando los espacios en blanco
        const args = input.split(" "); //dividimos la entrada en argumentos separados por espacios
        const command = args[0]; //el primer argumento es el comando

        const commandFunctions = {
            "ping": () => command_ping(networkObjectId, args),
            "dhcp": () => command_Dhcp(networkObjectId, args),
            "iptables": () => command_Iptables(networkObjectId, args),
            "ifup": () => command_ifup(networkObjectId, args[1]),
            "ifdown": () => command_ifdown(networkObjectId, args[1]),
            "ip": () => command_Ip(networkObjectId, args),
            "dns": () => command_dns(networkObjectId, args),
            "dig": () => command_dig(networkObjectId, args),
            "arp": () => command_arp(networkObjectId, args),
            "apache": () => command_apache(networkObjectId, args),
            "nano": () => command_nano(networkObjectId, args[1]),
            "help": () => command_help(),
            "man": () => command_man(args[1]),
            "traceroute": () => command_traceroute(networkObjectId, args),
            "systemctl": () => command_systemctl(networkObjectId, args),
            "apt": () => command_apt(networkObjectId, args),
            "mkdir": () => command_mkdir(networkObjectId, args[1]),
            "touch": () => command_touch(networkObjectId, args[1]),
            "rm": () => command_rm(networkObjectId, args[1]),
            "mv": () => command_mv(networkObjectId, args),
            "ls": () => command_ls(networkObjectId, args.slice(1)),
            "cd": () => command_cd(networkObjectId, args[1]),
            "cat": () => command_cat(networkObjectId, args[1]),
            "exit": () => closeTerminal(event)
        }

        window.clearInterval(window.pingInterval); //limpiamos todos los procesos de terminal en funcionamiento
        document.querySelector(".terminal-output").innerHTML = ""; //limpiamos la salida
        terminalBuffer.push(input); //añadimos el comando en el buffer
        currentCommandIndex++; //actualizamos el indice del cursor de comandos
        $terminal.querySelector("input").value = ""; //limpiamos la entrada
        commandFunctions[command] ? commandFunctions[command]() : terminalMessage(`Error: comando ${command} desconocido.`, networkObjectId); //ejecutamos la función correspondiente
    }

}
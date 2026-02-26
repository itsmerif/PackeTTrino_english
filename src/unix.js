function unixParser(event) {

    const $terminal = document.querySelector(".terminal-component");
    const networkObjectId = $terminal.dataset.id;

    if (event.key === "Enter") {

        const input = event.target.value.trim(); // We get the input by removing the whitespace
        const args = input.split(" ");  // We split the input into space-separated arguments
        const command = args[0]; // The first argument is the command

        const commandFunctions = {
            "ping": () => command_ping(networkObjectId, args[1]),
            "iptables": () => command_Iptables(networkObjectId, args),
            "ifup": () => command_ifup(networkObjectId, args[1]),
            "ifdown": () => command_ifdown(networkObjectId, args[1]),
            "ip": () => command_Ip(networkObjectId, args),
            "dns": () => command_dns(networkObjectId, args),
            "dig": () => command_dig(networkObjectId, args),
            "arp": () => command_arp(networkObjectId, args),
            "nano": () => command_nano(networkObjectId, args[1]),
            "man": () => command_man(networkObjectId, args[1]),
            "traceroute": () => command_traceroute(networkObjectId, args.slice(1)),
            "systemctl": () => command_systemctl(networkObjectId, args),
            "apt": () => command_apt(networkObjectId, args),
            "mkdir": () => command_mkdir(networkObjectId, args[1]),
            "touch": () => command_touch(networkObjectId, args[1]),
            "rm": () => command_rm(networkObjectId, args[1]),
            "mv": () => command_mv(networkObjectId, args),
            "ls": () => command_ls(networkObjectId, args.slice(1)),
            "cd": () => command_cd(networkObjectId, args[1]),
            "cat": () => command_cat(networkObjectId, args[1]),
            "exit": () => closeTerminal(event),
            "curl": () => command_curl(networkObjectId, args),
            "visual": () => command_visual(networkObjectId, args),
            "cp": () => command_cp(networkObjectId, args.slice(1)),
            "realnode": () => command_realnode(networkObjectId, args.slice(1)),
            "iface": () => command_iface(networkObjectId, args),
            "ipv4-forwarding": () => command_ipv4_forwarding(networkObjectId, args.slice(1)),
        }

        window.clearInterval(window.pingInterval); // Clear all running terminal processes
        document.querySelector(".terminal-output").innerHTML = ""; // Clear the output
        terminalBuffer.push(input); // Add the command to the buffer
        currentCommandIndex++; // Update the command cursor index
        $terminal.querySelector("input").value = ""; // Clear the input
        commandFunctions[command] ? commandFunctions[command]() : terminalMessage(`Error: unknown command ${command}.`, networkObjectId); //we execute the corresponding function
    }

}

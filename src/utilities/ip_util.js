function command_Ip(networkObjectId, args) {
    
    if (args[1] === "addr" || args[1] === "a") {

        if (args.length === 2) {
            showObjectInfo(networkObjectId);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 6) {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip]/[netmask] dev [interface]');
                return;
            }

            if (!isValidCidrIp(args[3])) {
                terminalMessage("Error: La IP introducida no es válida.");
                return;
            }

            let [ip, netmask] = parseCidr(args[3]);

            if (args[4] !== "dev") {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip]/[netmask] dev [interface]');
                return;
            }

            if (!getInterfaces(networkObjectId).includes(args[5])) {
                terminalMessage(`Error: Interfaz ${args[5]} no existe.`);
                return;
            }

            let interface = args[5];
            configureInterface(networkObjectId, ip, netmask, interface);

            return;
            
        }

        if (args[2] === "del") {

            if (args.length !== 4) {
                terminalMessage('Error de argumentos. Sintaxis: ip addr del [interface]');
                return;
            }

            if (args[3] !== "enp0s3" && args[3] !== "enp0s8" && args[3] !== "enp0s9") {
                terminalMessage("Error: La interfaz introducida no es válida.");
                return;
            }

            removeNetwork(networkObjectId, args[3]);
            return;
        }

    }

    if (args[1] === "route" || args[1] === "r") {

        if (args.length === 2) {
            printRoutingTable(networkObjectId);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 6) {
                terminalMessage('Error de argumentos. Sintaxis: ip route add [destination/netmask] via [nexthop]', networkObjectId);
                return;
            }
            
            if (!isValidCidrIp(args[3]) && args[3] !== "default") {
                terminalMessage("Error: La red de destino introducida no es válida.", networkObjectId);
                return;
            }

            let [destination, netmask] = (args[3] === "default") ? ["0.0.0.0", "0.0.0.0"] : parseCidr(args[3]);

            if (args[4] !== "via") {
                terminalMessage('Error de argumentos. Sintaxis: ip route add [destination/netmask] via [nexthop]', networkObjectId);
                return;
            }

            if (!isValidIp(args[5])) {
                terminalMessage("Error: La IP de siguiente salto introducida no es válida.", networkObjectId);
                return;
            }

            let nexthop = args[5];
            let interface = getReachableInterface(networkObjectId, nexthop);

            if (!interface) {
                terminalMessage("Error: El Siguiente Salto introducido no es accesible.", networkObjectId);
                return;
            }

            let gateway = fromRouterInterface(networkObjectId, interface, "gateway");

            addRoutingEntry(networkObjectId, destination, netmask, gateway, interface, nexthop); 

            return;

        }

        if (args[2] === "del") {

            if (args.length !== 5) {
                terminalMessage('Error de argumentos. Sintaxis: ip route del [destination] [netmask]', networkObjectId);
                return;
            }

            removeRoutingEntry(networkObjectId, args[3], args[4]);
            return;
        }

        if (args[2] === "restore") {
            removeRemotesRules(networkObjectId);
            return;
        }

    }

    terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]', networkObjectId);

}
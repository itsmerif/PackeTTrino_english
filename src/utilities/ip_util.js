function command_Ip(routerObjectId, args) {
    
    if (args[1] === "addr" || args[1] === "a") {

        if (args.length === 2) {
            showObjectInfo(routerObjectId);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 7) {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]');
                return;
            }

            if (args[2] !== "add" && args[2] !== "del") {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]');
                return;
            }

            if (!isValidIp(args[3])) {
                terminalMessage("Error: La IP introducida no es válida.");
                return;
            }

            if (!isValidIp(args[4])) {
                terminalMessage("Error: La máscara de red introducida no es válida.");
                return;
            }

            if (args[5] !== "dev") {
                terminalMessage('Error de argumentos. Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]');
                return;
            }

            if (args[6] !== "enp0s3" && args[6] !== "enp0s8" && args[6] !== "enp0s9") {
                terminalMessage("Error: La interfaz introducida no es válida.");
                return;
            }

            addNetwork(routerObjectId, args[3], args[4], args[6]);
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

            removeNetwork(routerObjectId, args[3]);
            return;
        }

    }

    if (args[1] === "route" || args[1] === "r") { //ip route add 192.168.3.0/24 dev eth0

        if (args.length === 2) {
            printRoutingTable(routerObjectId);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 6) {
                terminalMessage('Error de argumentos. Sintaxis: ip route add [destination/netmask] via [nexthop]');
                return;
            }
            
            if (!isValidCidrIp(args[3]) && args[3] !== "default") {
                terminalMessage("Error: La red de destino introducida no es válida.");
                return;
            }

            let [destination, netmask] = (args[3] === "default") ? ["0.0.0.0", "0.0.0.0"] : parseCidr(args[3]);

            if (args[4] !== "via") {
                terminalMessage('Error de argumentos. Sintaxis: ip route add [destination/netmask] via [nexthop]');
                return;
            }

            if (!isValidIp(args[5])) {
                terminalMessage("Error: La IP de siguiente salto introducida no es válida.");
                return;
            }

            let nexthop = args[5];
            let interface = getReachableInterface(routerObjectId, nexthop);

            if (!interface) {
                terminalMessage("Error: El Siguiente Salto introducido no es accesible.");
                return;
            }

            let gateway = fromRouterInterface(routerObjectId, interface, "gateway");

            addRoutingEntry(routerObjectId, destination, netmask, gateway, interface, nexthop); 

            return;

        }

        if (args[2] === "del") {

            if (args.length !== 5) {
                terminalMessage('Error de argumentos. Sintaxis: ip route del [destination] [netmask]');
                return;
            }

            removeRoutingEntry(routerObjectId, args[3], args[4]);
            return;
        }

        if (args[2] === "restore") {
            removeRemotesRules(routerObjectId);
            return;
        }

    }

    terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');

}
function command_Ip(id, args) {

    if (args[1] === "addr" || args[1] === "a") { //mostramos la informacion del equipo, solo puede ser ejecutado desde un pc

        if (args.length === 2) {
            showObjectInfo(id);
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

            addNetwork(id, args[3], args[4], args[6]);
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

            removeNetwork(id, args[3]);
            return;
        }

    }

    if (args[1] === "route" || args[1] === "r") { //añadir reglas de enrutamiento, solo puede ser ejecutado desde un router

        if (args.length === 2) {
            printRoutingTable(id);
            return;
        }

        if (args[2] === "add") {

            if (args.length !== 8) {
                terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');
                return;
            }
    
            if (args[2] !== "add" && args[2] !== "del" || args[5] !== "via") {
                terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');
                return;
            }

            addRoutingEntry(id, args[3], args[4], args[6], args[7]);
            return;
        }

        if (args[2] === "del") { //sintaxis: ip route del [destination] [netmask]

            if (args.length !== 5) {
                terminalMessage('Error de argumentos. Sintaxis: ip route del [destination] [netmask]');
                return;
            }

            removeRoutingEntry(id, args[3], args[4]);
            return;
        }
    }

    terminalMessage('Error de argumentos. Sintaxis: ip < route | a > [add|del] [destination] [netmask] via [interface] [nexthop]');

}
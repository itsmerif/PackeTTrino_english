function command_Ip(networkObjectId, args) {
    
    let opt_addr = false;
    let opt_route = false;
    let opt_flush = false;
    let opt_add = false;
    let opt_del = false;
    let opt_dev = false;
    let opt_via = false;
    let val_add;
    let val_del;
    let val_via;
    let val_dev;

    let $OPTS = catchopts(["addr", "route", "add:", "flush", "del:", "via:", "dev:"], args);
    
    const optionHandlers = {

        "addr": () => opt_addr = true,

        "route": () => opt_route = true,

        "add": () => {
            opt_add = true;
            val_add = $OPTS["add"];
        },

        "flush": () => opt_flush = true,

        "del": () => {
            opt_del = true;
            val_del = $OPTS["del"];
        },

        "via": () => {
            opt_via = true;
            val_via = $OPTS["via"];
        },

        "dev": () => {
            opt_dev = true;
            val_dev = $OPTS["dev"];
        }

    }

    for (option in $OPTS) {
        if (optionHandlers[option]) optionHandlers[option]();
    }

    if (opt_addr === opt_route) {
        terminalMessage('Error de argumentos: ip [addr|route] [add|flush|del] [ip/netmask] [dev interface] ] [via ip].', networkObjectId);
        return;
    }

    if (opt_addr) { //ip addr [add|flush] [ip]/[netmask] dev [interface]

        if (opt_add && opt_flush) {
            terminalMessage('Error de argumentos: ip [addr|route] [add|flush|del] [ip/netmask] [dev interface] [via ip]', networkObjectId);
            return;
        }

        if (!opt_add && !opt_flush) {
            showNetworkObjectInfo(networkObjectId);
            return;
        }

        if (opt_add) { //ip addr add [ip]/[netmask] dev [interface]

            if (!isValidCidrIp(val_add)) {
                terminalMessage(`Se esperaba un prefijo válido cerca de ${val_add}.`, networkObjectId);
                return;
            }

            if (!getInterfaces(networkObjectId).includes(val_dev)) {
                terminalMessage(`No se reconoce la interfaz ${val_dev}`, networkObjectId);	
                return;
            }

            let [ip, netmask] = parseCidr(val_add);
            configureInterface(networkObjectId, ip, netmask, val_dev);
            setDirectRoutingRule(networkObjectId, ip, netmask, val_dev);
            terminalMessage(`Se ha añadido la IP ${val_add} a la interfaz ${val_dev} con éxito.`, networkObjectId);
        }        

        if (opt_flush) { //ip addr flush dev [interface]

            if (!getInterfaces(networkObjectId).includes(val_dev)) {
                terminalMessage(`No se reconoce la interfaz ${val_dev}`, networkObjectId);	
                return;
            }

            deconfigureInterface(networkObjectId, val_dev);
            removeDirectRoutingRule(networkObjectId, val_dev);
            terminalMessage(`Se ha ha desconfigurado la IP de la interfaz ${val_dev} con éxito.`, networkObjectId);
        }

    }

    if (opt_route) { //ip route [add|del] [ip]/[netmask] via [gateway] dev [interface]

        if (opt_add && opt_del) {
            terminalMessage('Error de argumentos: ip [addr|route] [add|flush|del] [ip/netmask] [dev interface] [via ip]', networkObjectId);
            return;
        }

        if (!opt_add && !opt_del) {
            printRouting(networkObjectId);
            return;
        }

        if (opt_add) { //ip route add [ip]/[netmask] via [ip] dev [interface]

            if (!isValidCidrIp(val_add)) {
                if (val_add === "default") val_add = "0.0.0.0/0";
                else {
                    terminalMessage(`Se esperaba un prefijo válido en vez de ${val_add}.`, networkObjectId);
                    return;
                }
            }

            if (!isValidIp(val_via)) {
                terminalMessage(`Se esperaba una ip válida en vez de ${val_via}.`, networkObjectId);
                return;
            }

            if (!getInterfaces(networkObjectId).includes(val_dev)) {
                terminalMessage(`No se reconoce la interfaz ${val_dev}`, networkObjectId);	
                return;
            }

            let [ip, netmask] = parseCidr(val_add);

            setRemoteRoutingRule(networkObjectId,
                ip, //red de destino
                netmask, //mascara de red
                getInfoFromInterface(networkObjectId, val_dev)[0], //gateway
                val_dev, //interfaz
                val_via //siguiente salto
            );

            terminalMessage(`Se ha añadido la ruta ${val_add} a la interfaz ${val_dev} con éxito.`, networkObjectId);

        }

        if (opt_del) { //ip route del [ip]/[netmask]

            if (!isValidCidrIp(val_del)) {
                terminalMessage(`Se esperaba un prefijo válido cerca de ${val_del}.`, networkObjectId);
                return;
            }

            let [ip, netmask] = parseCidr(val_del);
            removeRemoteRoutingRule(networkObjectId, getNetwork(ip, netmask), netmask);
            terminalMessage(`Se ha eliminado la ruta ${val_del} con éxito.`, networkObjectId);

        }

    }

}
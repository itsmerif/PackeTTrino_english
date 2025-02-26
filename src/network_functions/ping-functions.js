async function ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const switchObjectId = $networkObject.getAttribute("data-switch");

    //gestion de entrada

    if (dataId.includes("router-")) { //se reenvia a la funcion especifica para routers
        router_ping(dataId, args);
        return;
    }

    if (args.length !== 2) {
        terminalMessage("Error: Sintaxis: ping <ip | dominio>");
        return;
    }

    //gestion de equipo

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectMac) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    //generamos el paquete

    cleanPacketTraffic(); //limpiamos la tabla de paquetes

    //caso 1) el valor introducido es una nombre de dominio

    if (!args[1].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
        dnsRequestFlag = false;
        dig(dataId, args[1], false);
        setTimeout(() => {
            if (!dnsRequestFlag) {
                terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            } else {
                try { //intentamos hacer ping a la ip de respuesta
                    icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, isDomainInCachePc(dataId, args[1])[1]);
                } catch (error) {
                    ping_f(networkObjectIp);
                    return;
                }
                if (!icmpFlag) {
                    ping_f(networkObjectIp);
                } else {
                    ping_s(networkObjectIp);
                }
            }
        }, 500);
        return;
    }

    //caso 2) el valor introducido es una ip

    if (args[1] === getNetwork(networkObjectIp, networkObjectNetmask)) { //no se le permite hacer ping a la red
        terminalMessage("Error: La IP de destino introducida no es válida.");
        return;
    }

    if (args[1] === networkObjectIp) { //es el mismo equipo, lo damos por exito
        ping_s(networkObjectIp);
        return;
    }

    //ejecucion

    if (visualToggle) {

        try {
            icmpFlag = false;
            await minimizeTerminal();
            await icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, args[1]);
            await new Promise(resolve => setTimeout(resolve, 1000));
            let waitTime = 0;
            while (!icmpFlag) {
                await new Promise(resolve => setTimeout(resolve, 100));
                waitTime += 100;
            }
            await maximizeTerminal();
            if (!icmpFlag) {
                ping_f(networkObjectIp);
            } else {
                ping_s(networkObjectIp);
            }
        } catch (error) {
            await maximizeTerminal();
            ping_f(networkObjectIp);
        }

    } else { //no se usa visual

        try {
            icmpFlag = false;
            icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, args[1]);
            if (!icmpFlag) {
                ping_f(networkObjectIp);
            } else {
                ping_s(networkObjectIp);
            }
        } catch (error) {
            ping_f(networkObjectIp);
        }

    }

}

function router_ping(dataId, args) {

    const $routerObject = document.getElementById(dataId);
    const routerObjectIp = $routerObject.getAttribute("ip-enp0s3"); //obtenemos una ip válida del router, cualquiera
    const switchId = $routerObject.getAttribute("data-switch-enp0s3");
    const destinationIp = args[1];

    let newPacket = new IcmpEchoRequest(routerObjectIp, destinationIp, $routerObject.getAttribute("data-mac"), "");
    icmpFlag = false;
    cleanPacketTraffic(); //limpiamos la tabla de paquetes

    try {
        console.log("Ping desde router....");
        packetProcessor_router(switchId, dataId, newPacket);
    } catch (error) {
        ping_f(routerObjectIp);
        return;
    }

    if (!icmpFlag) {
        ping_f(routerObjectIp);
    } else {
        ping_s(routerObjectIp);
    }

}

function ping_s(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=1 ttl=64 time=0.030 ms\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 500);

}

function ping_f(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `From ${origin} icmp_seq=1 Destination Host Unreachable\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 500);

}

async function pingSim() {
    visualToggle = true;
    const form = document.querySelector(".ping-form");
    const originIp = form.ip1.value; //ip de origen
    const destination = form.ip2.value; 
    const $networkObject = document.querySelector(`[data-ip='${originIp}']`);

    if (!isValidIp(destination) ){ //lo tomamos como un nombre de dominio
        await dig($networkObject.id, destination, false);
    }

    await ping($networkObject.id, ["ping", destination]);
}
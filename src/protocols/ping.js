function ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const networkObjectMac = $networkObject.getAttribute("data-mac");
    const switchObjectId = $networkObject.getAttribute("data-switch");

    //gestion de entrada

    if (dataId.includes("router-")) { //por ahora solo se puede hacer ping desde un pc
        terminalMessage("Error: Este comando solo puede ser ejecutado desde un pc.");
        return;
    }

    if (args.length !== 2 ) {
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
        dig(dataId, args[1]);       
        setTimeout(() => {
            if (!dnsRequestFlag) {
                terminalMessage("Error: No se pudo resolver el nombre de dominio.");
            } else {
                try { //intentamos hacer ping a la ip de respuesta
                    icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, isDomainInCache(dataId, args[1])[1]);
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

    try {
        icmpFlag = false;
        icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, args[1]);
    } catch (error) {
        //terminalMessage(error.message);
        ping_f(networkObjectIp);
        return;
    }

    if (!icmpFlag) {
        ping_f(networkObjectIp);
    } else {
        ping_s(networkObjectIp);
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
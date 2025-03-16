async function ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const switchObjectId = $networkObject.getAttribute("data-switch");

    cleanPacketTraffic();

    if (!isValidIp(args[1])) { //el valor introducido es una nombre de dominio

        if (visualToggle) await minimizeTerminal();

        let destinationIp = await domainNameResolution(dataId, args[1]);
        if (!destinationIp) { //no se pudo resolver el dominio
            ping_f(networkObjectIp);
            return; 
        }

        try {
            await icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, destinationIp);
        } catch (error) {
            ping_f(networkObjectIp);
            return;
        }

        if (visualToggle) await maximizeTerminal();

        if (!icmpFlag) {
            ping_f(args[1]);
        } else {
            ping_s(args[1]);
        }

        return;
    }

    //caso 2) el valor introducido es una ip

    if (args[1] === getNetwork(networkObjectIp, networkObjectNetmask)) { //no se le permite hacer ping a la red
        terminalMessage("Error: La IP de destino introducida no es válida.");
        return;
    }

    if (args[1] === networkObjectIp) { //es el mismo equipo, lo damos por exito
        ping_s(args[1]);
        return;
    }

    if (visualToggle) {

        try {
            icmpFlag = false;
            await minimizeTerminal();
            await icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, args[1]);
            await maximizeTerminal();
            if (!icmpFlag) {
                ping_f(args[1]);
            } else {
                ping_s(args[1]);
            }
        } catch (error) {
            await maximizeTerminal();
            ping_f(args[1]);
        }

    } else { //no se usa visual

        try {
            icmpFlag = false;
            icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, args[1]);
            if (!icmpFlag) {
                ping_f(args[1]);
            } else {
                ping_s(args[1]);
            }
        } catch (error) {
            ping_f(args[1]);
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
    const terminal = document.querySelector(".terminal-component");
    if (terminal.style.display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=1 ttl=64 time=0.030 ms\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 500);

}

function ping_f(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (terminal.style.display === "none") return;
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
    const speed = form.speed.value;

    if (speed) {
        visualSpeed = parseInt(speed, 10);
    }

    const $networkObject = document.querySelector(`[data-ip='${originIp}']`)
        || document.querySelector(`[ip-enp0s3='${originIp}']`)
        || document.querySelector(`[ip-enp0s8='${originIp}']`)
        || document.querySelector(`[ip-enp0s9='${originIp}']`);

    if (!$networkObject) return;
    await ping($networkObject.id, ["ping", destination]);

}

function isDomainInEtcHosts(dataId, domain) {
    const $networkObject = document.getElementById(dataId);
    const etcHostFile = $networkObject.getAttribute("data-etc-hosts");
    let etcHostsEntries = JSON.parse(etcHostFile);

    for (let ip in etcHostsEntries) {
        if (etcHostsEntries[ip].includes(domain)) {
            return ip;
        }
    }

   return false;

}

async function domainNameResolution(dataId, domain) {

    let response;

    //primero miramos en el /etc/hosts

    response = isDomainInEtcHosts(dataId, domain);
    if (response) return response;

    //no se encuentra en el /etc/hosts, buscamos en la cache, y si no, en el servidor

    try {
        await dig(dataId, domain, false);  
        return isDomainInCachePc(dataId, domain)[1];
    } catch (error) {
        return false;
    }

}
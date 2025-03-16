async function ping(dataId, args) {

    const $networkObject = document.getElementById(dataId);
    const networkObjectIp = $networkObject.getAttribute("data-ip");
    const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
    const switchObjectId = $networkObject.getAttribute("data-switch");
    let destinationIp = args[1];

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();
    
    if (!isValidIp(destinationIp)) { 

        destinationIp = await domainNameResolution(dataId, args[1]);

        if (!destinationIp) { //no se pudo resolver el dominio
            if (visualToggle) await maximizeTerminal();
            ping_f(destinationIp);
            return;
        }
        
    }

    if (destinationIp === getNetwork(destinationIp, networkObjectNetmask)) { //no se le permite hacer ping a una red
        if (visualToggle) await maximizeTerminal();
        ping_f(destinationIp);
        return;
    }

    if (destinationIp === networkObjectIp || getNetwork(destinationIp, "255.0.0.0") === "127.0.0.0") {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (visualToggle) await maximizeTerminal();
        ping_s(destinationIp);
        return;
    }

    try {
        await icmpRequestPacketGenerator(dataId, switchObjectId, networkObjectIp, destinationIp);
    } catch (error) {
        if (visualToggle) await maximizeTerminal();
        ping_f(destinationIp);
        return;
    }
    
    if (!icmpFlag) {
        ping_f(destinationIp);
    } else {
        ping_s(destinationIp);
    }

    if (visualToggle) await maximizeTerminal();

}

async function router_ping(dataId, args) {

    const $routerObject = document.getElementById(dataId);
    const routerObjectIp = $routerObject.getAttribute("ip-enp0s3"); //obtenemos una ip válida del router, cualquiera
    const switchId = $routerObject.getAttribute("data-switch-enp0s3");
    const destinationIp = args[1];
    let newPacket = new IcmpEchoRequest(routerObjectIp, destinationIp, $routerObject.getAttribute("data-mac"), "");
    icmpFlag = false;

    cleanPacketTraffic();

    if (visualToggle) await minimizeTerminal();

    try {
        await packetProcessor_router(switchId, dataId, newPacket);
    } catch (error) {
        if (visualToggle) await maximizeTerminal();
        ping_f(routerObjectIp);
        return;
    }

    if (!icmpFlag) {
        ping_f(routerObjectIp);
    } else {
        ping_s(routerObjectIp);
    }

    if (visualToggle) await maximizeTerminal();

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
    await command_ping($networkObject.id, ["ping", destination]);

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
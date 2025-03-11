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
    console.log("pingSim");
    const form = document.querySelector(".ping-form");
    const originIp = form.ip1.value; //ip de origen
    const destination = form.ip2.value; 
    const speed = form.speed.value;
    if (speed) {
        visualSpeed = parseInt(speed, 10);
    }
    const $networkObject = document.querySelector(`[data-ip='${originIp}']`);
    await ping($networkObject.id, ["ping", destination]);
}
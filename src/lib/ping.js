function pingSuccess(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (window.getComputedStyle(terminal).display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=1 ttl=64 time=0.030 ms\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 500);

}

function pingFailure(origin) {
    const terminal = document.querySelector(".terminal-component");
    if (window.getComputedStyle(terminal).display === "none") return;
    const terminalOutput = document.querySelector(".terminal-output");
    terminalOutput.innerHTML += `From ${origin} icmp_seq=1 Destination Host Unreachable\n`
    let seq = 2;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 500);
}

async function pingSimulator(originIp, destinationIp) {

    visualToggle = true;

    const $networkObject = document.querySelector(`[data-ip='${originIp}']`)
        || document.querySelector(`[ip-enp0s3='${originIp}']`)
        || document.querySelector(`[ip-enp0s8='${originIp}']`)
        || document.querySelector(`[ip-enp0s9='${originIp}']`);

    if (!$networkObject) return;
    
    await command_ping($networkObject.id, ["ping", destinationIp]);

}


async function icmpTryoutProcess(id) {

    const $networkObject = document.getElementById(id);
    const $board = document.querySelector(".board");

    if (icmpTryoutObject1 === "") {
        
        icmpTryoutObject1Ip = getAvailableIps($networkObject.id)[0];

        if (!icmpTryoutObject1Ip) {
            bodyComponent.render(popupMessage("<span>Error: </span>No se ha encontrado la IP del objeto " + id));
            return;
        }
        
        icmpTryoutObject1 = id;
        createPacketIndicator(id);
        return;
    }

    icmpTryoutObject2Ip = getAvailableIps($networkObject.id)[0];

    if (!icmpTryoutObject2Ip) {
        bodyComponent.render(popupMessage("<span>Error: </span>No se ha encontrado la IP del objeto " + id));
        return;
    }

    icmpTryoutObject2 = id;
    createPacketIndicator(id);
    await pingSimulator(icmpTryoutObject1Ip, icmpTryoutObject2Ip);
    $board.querySelectorAll(".pack-cursor").forEach(cursor => {cursor.remove();});
    icmpTryoutObject1 = "";
    icmpTryoutObject2 = "";
}
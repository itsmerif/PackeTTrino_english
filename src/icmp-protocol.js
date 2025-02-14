function ping(originIP, destinationIP) {

    try {

        sendPacket(originIP, destinationIP); //echo request

        try {

            sendPacket(destinationIP, originIP); //echo reply
            ping_s(originIP);

        }catch (error) {

            console.log("vuelta: " + error);
            ping_f(originIP);

        }

    } catch (error) {

        console.log("ida: " + error);
        ping_f(originIP);

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

function ping(originIP, destinationIP) {

    try {

        sendPacket(originIP, destinationIP);

        try {

            sendPacket(destinationIP, originIP);
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

function dragPingForm(event) {

    event.preventDefault();
    document.body.style.cursor = "move";
    const pingform = event.target.closest(".ping-form");
    let rect = pingform.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;
    pingform.style.right = 'auto';
    pingform.style.left = `${rect.left}px`;
    pingform.style.top = `${rect.top}px`;

    function movePingForm(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - pingform.offsetWidth;
        let maxY = window.innerHeight - pingform.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        pingform.style.left = `${x}px`;
        pingform.style.top = `${y}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', movePingForm);
        document.removeEventListener('mouseup', stopDragging);
        document.body.style.cursor = "default";
    }

    document.addEventListener('mousemove', movePingForm);
    document.addEventListener('mouseup', stopDragging);
}
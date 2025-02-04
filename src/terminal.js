function sendCommand(event) {

    const terminal = event.target.closest('.pc-terminal');
    const dataId = terminal.dataset.id;

    if (event.key === "Enter") {

        const input = event.target.value.trim();
        let newoutput = "";

        switch (input) {

            case "ping":
                newoutput = ping(dataId);
                break;
            case "ipconfig":
                newoutput = ipconfig(dataId);
                break;
            case "exit":
                event.target.value = "";
                document.querySelector(".pc-terminal").style.display = "none";
                break;
            default:
                newoutput = eval(input);
                break;
        }

        document.querySelector(".terminal-output").innerHTML = newoutput;
    }
}

function clickTerminal(event) {
    const terminal = event.target.closest(".pc-terminal");
    const input = terminal.querySelector("input");
    input.focus();
}

function ping(originId) {
    //obtengo el origen
    const NetworkOriginObject = document.getElementById(originId);
    //de ese origen obtengo el switch
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchIdentity);
    //de ese switch obtengo las macs
    const macs = switchOriginObject.querySelector("table").querySelectorAll(".mac-address");    
    return Array.from(macs).map(mac => `<p>${mac.innerHTML}</p>`).join("<br>");
}
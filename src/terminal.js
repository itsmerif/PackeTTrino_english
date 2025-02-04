function sendCommand(event) {

    const terminal = event.target.closest('.pc-terminal');
    const dataId = terminal.dataset.id;
    const originIP = document.getElementById(dataId).getAttribute("data-ip");

    if (event.key === "Enter") {

        const input = event.target.value.trim();
        const args = input.split(" ");
        const command = args[0];
        let newoutput = "";

        switch (command) {

            case "ping":
                const destinationIP = args[1] || "0.0.0.0";
                newoutput = ping(originIP, destinationIP);
                break;
            case "ipconfig":
                newoutput = ipconfig(dataId);
                break;
            case "exit":
                event.target.value = "";
                document.querySelector(".pc-terminal").style.display = "none";
                break;
            default:
                newoutput = "Command not found";
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
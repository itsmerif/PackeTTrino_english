function sendCommand(event) {

    const terminal = event.target.closest('.pc-terminal');
    const dataId = terminal.dataset.id;


    if (event.key === "Enter") {

        const input = event.target.value.trim();
        let newoutput = "";

        switch (input) {

            case "hola":
                newoutput = "hola";
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
    console.log('click');
}
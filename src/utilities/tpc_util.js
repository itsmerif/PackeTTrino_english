async function command_tcp(id, args) {

    const validPorts = ["22", "80", "443"];

    if (args.length !== 3) {
        terminalMessage('Error de argumentos. Sintaxis: tcp [ip] [port]');
        return;
    }

    if (!args[1].match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
        terminalMessage("Error: La IP de destino introducida no es válida.");
        return;
    }

    if (!validPorts.includes(args[2].trim())) {
        terminalMessage("Error: El puerto introducido no es válido.");
        return;
    }

    const $networkObject = document.getElementById(id);

    if ($networkObject.getAttribute("ip-enp0s3") === args[1]) {   
        terminalMessage("Error: No se puede conectar a un equipo a si mismo.");
        return;
    }

    await tcp(id, args[1], args[2]);

}
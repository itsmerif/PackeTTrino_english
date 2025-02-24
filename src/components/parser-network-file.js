function parserNetworkFile() {

    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".pc-terminal").dataset.id);
    const fileContent = fileEditor.value;
    const lines = fileContent.split("\n");
    let found = false;

    if (!$networkObject.id.startsWith("router-")) { //para los hosts

        for (let i = 0; i < lines.length; i++) {

            if (lines[i].startsWith("auto enp0s3")) { //miramos las 4 siguientes lineas

                if (lines[i + 1] === "iface enp0s3 inet static") { //interfaz enp0s3 está configurado como estático

                    if (!lines[i + 2].match(/^address \S+$/)) return;
                    if (!lines[i + 3].match(/^netmask \S+$/)) return;
                    if (!lines[i + 4].match(/^gateway \S+$/)) return;
                    let ip = lines[i + 2].split(" ")[1];
                    let netmask = lines[i + 3].split(" ")[1];
                    let gateway = lines[i + 4].split(" ")[1];

                    if (!isValidIp(ip) || !isValidIp(netmask) || !isValidIp(gateway)) {
                        terminalMessage("Error: El archivo contiene errores.");
                        return;
                    }

                    $networkObject.setAttribute("data-ip", ip);
                    $networkObject.setAttribute("data-netmask", netmask);
                    $networkObject.setAttribute("data-gateway", gateway);
                    found = true;
                    terminalMessage("El archivo se ha cargado correctamente.");
                }

                if (lines[i + 1] === "iface enp0s3 inet dhcp") {

                    $networkObject.setAttribute("data-dhcp", "true");
                    found = true;
                    terminalMessage("El archivo se ha cargado correctamente.");

                }

            }
        }

        if (!found) terminalMessage("Error: El archivo contiene errores.");
        return;

    }


    //para los routers

    for (let i = 0; i < lines.length; i++) {

        if (lines[i] === "auto enp0s3" && lines[i + 1] === "iface enp0s3 inet static") {
            if (!lines[i + 2].match(/^address \S+$/)) return;
            if (!lines[i + 3].match(/^netmask \S+$/)) return;
            let ip = lines[i + 2].split(" ")[1];
            let netmask = lines[i + 3].split(" ")[1];
            if (!isValidIp(ip) || !isValidIp(netmask)) {
                terminalMessage("Error: El archivo contiene errores. IP o netmask no válido.");
                return;
            }
            $networkObject.setAttribute("ip-enp0s3", ip);
            $networkObject.setAttribute("netmask-enp0s3", netmask);
            found = true;
            terminalMessage("El archivo se ha cargado correctamente.");
        }

        if (lines[i] === "auto enp0s8" && lines[i + 1] === "iface enp0s8 inet static") {
            if (!lines[i + 2].match(/^address \S+$/)) return;
            if (!lines[i + 3].match(/^netmask \S+$/)) return;
            let ip = lines[i + 2].split(" ")[1];
            let netmask = lines[i + 3].split(" ")[1];
            if (!isValidIp(ip) || !isValidIp(netmask)) {
                terminalMessage("Error: El archivo contiene errores. IP o netmask no válido.");
                return;
            }
            $networkObject.setAttribute("ip-enp0s8", ip);
            $networkObject.setAttribute("netmask-enp0s8", netmask);
            found = true;
            terminalMessage("El archivo se ha cargado correctamente.");
        }

        if (lines[i] === "auto enp0s9" && lines[i + 1] === "iface enp0s9 inet static") {
            if (!lines[i + 2].match(/^address \S+$/)) return;
            if (!lines[i + 3].match(/^netmask \S+$/)) return;
            let ip = lines[i + 2].split(" ")[1];
            let netmask = lines[i + 3].split(" ")[1];
            if (!isValidIp(ip) || !isValidIp(netmask)) {
                terminalMessage("Error: El archivo contiene errores. IP o netmask no válido.");
                return;
            }
            $networkObject.setAttribute("ip-enp0s9", ip);
            $networkObject.setAttribute("netmask-enp0s9", netmask);
            found = true;
            terminalMessage("El archivo se ha cargado correctamente.");
        }

    }

    if (!found) terminalMessage("Error: El archivo contiene errores.");

}
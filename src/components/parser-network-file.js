function parserNetworkFile() {

    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".pc-terminal").dataset.id);
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");
    //eliminamos las lineas vacias
    const lines = unfilteredlines.filter(line => line.trim() !== "");
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

                    if (!isValidIp(ip)) {
                        terminalMessage(`Error en la línea ${i + 2}: IP no válida.`);
                        return;            
                    }

                    if (!isValidIp(netmask)) {
                        terminalMessage(`Error en la línea ${i + 3}: Netmask no válida.`);
                        return;
                    }

                    if (!isValidIp(gateway)) {
                        terminalMessage(`Error en la línea ${i + 4}: Gateway no válida.`);
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

    const routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    for (let i = 0; i < lines.length; i++) {

        if (lines[i] === "auto enp0s3" && lines[i + 1] === "iface enp0s3 inet static") { 

            //buscamos la direccion ip y mascara de red

            if (!lines[i + 2].match(/^address \S+$/)) {
                terminalMessage(`Error en la línea ${i + 2}: formato no válido.`);
                return;
            }

            if (!lines[i + 3].match(/^netmask \S+$/)) {
                terminalMessage(`Error en la línea ${i + 3}: formato no válido.`);
                return;
            }

            let ip = lines[i + 2].split(" ")[1];

            let netmask = lines[i + 3].split(" ")[1];

            if (!isValidIp(ip)){
                terminalMessage(`Error en la línea ${i + 2}: IP no válida.`);
                return;
            }

            if (!isValidIp(netmask)) {
                terminalMessage(`Error en la línea ${i + 3}: Netmask no válida.`);
                return;
            }

            $networkObject.setAttribute("ip-enp0s3", ip);       
            $networkObject.setAttribute("netmask-enp0s3", netmask);

            //añadimos la nueva configuracion a la tabla de enrutamiento

            rows[1].querySelectorAll("td")[0].innerText = getNetwork(ip, netmask);
            rows[1].querySelectorAll("td")[1].innerText = netmask;
            rows[1].querySelectorAll("td")[2].innerText = ip;
            rows[1].querySelectorAll("td")[3].innerText = "enp0s3";
            
            //ahora buscamos las reglas de enrutamiento

            let j = i + 4;

            while (j < lines.length && lines[j].startsWith("ip route add")) { //ip route add 192.168.1.0/24 via 192.168.1.1
                let destinationCidr; let nextHop; let [destination, destinationNetmask] = [];
                //destino y mascara de red
                destinationCidr = lines[j].split(" ")[3];
                if (!isValidCidrIp(destinationCidr)) {
                    terminalMessage(`Error en la líneas ${j}: dirección IP en CIDR no válida.`)
                    return
                }
                [destination, destinationNetmask] = parseCidr(lines[j].split(" ")[3]);
                //compruebo que exista la palabra clave "via"
                if (lines[j].split(" ")[4] !== "via") {
                    terminalMessage(`Error en la línea ${j}: se esperaba 'via' `);
                    return;
                }
                //siguiente salto
                nextHop = lines[j].split(" ")[5];
                if (!isValidIp(nextHop) || getNetwork(nextHop, netmask) !== getNetwork(ip, netmask)) {
                    terminalMessage(`Error en la línea ${j}: siguiente salto no válido.`);
                    return;
                }
                //si se cumple todo esto
                addRoutingEntry($networkObject.id, destination, destinationNetmask, "enp0s3", nextHop);
                j++;
            }

            found = true;
            terminalMessage("El archivo se ha cargado correctamente.");

        }

        if (lines[i] === "auto enp0s8" && lines[i + 1] === "iface enp0s8 inet static") {

            if (!lines[i + 2].match(/^address \S+$/)) return;
            if (!lines[i + 3].match(/^netmask \S+$/)) return;
            let ip = lines[i + 2].split(" ")[1];
            let netmask = lines[i + 3].split(" ")[1];

            if (!isValidIp(ip)){
                terminalMessage(`Error en la línea ${i + 2}: IP no válida.`);
                return;
            }

            if (!isValidIp(netmask)) {
                terminalMessage(`Error en la línea ${i + 3}: Netmask no válida.`);
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

            if (!isValidIp(ip)){
                terminalMessage(`Error en la línea ${i + 2}: IP no válida.`);
                return;
            }

            if (!isValidIp(netmask)) {
                terminalMessage(`Error en la línea ${i + 3}: Netmask no válida.`);
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
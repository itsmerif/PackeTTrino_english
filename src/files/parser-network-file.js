function loadNetworkFile(dataId) {

    const fileEditorContainer = document.querySelector(".editor-container");
    const networkObjectId = document.querySelector(".pc-terminal").dataset.id;
    let content = fileEditorContainer.querySelector(".file-editor");
    
    if (!networkObjectId.startsWith("router-")) {
        //añadimos el puntero al editor
        content.setAttribute("data-file", "/etc/network/interfaces");
        //obtenemos la información del objeto
        const $networkObject = document.getElementById(dataId);
        const networkObjectIp = $networkObject.getAttribute("data-ip");
        const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
        const networkObjectGateway = $networkObject.getAttribute("data-gateway");
        //creamos el contenido del archivo
        let fileContent;
        fileContent = `#The loopback network interface\n`;
        fileContent += `\n`;
        //loopback
        fileContent += `auto lo\niface lo inet loopback\n`;
        fileContent += `\n`;
        //interfaz enp0s3
        fileContent += `# The primary network interface\n`;
        fileContent += `\n`;
        if (networkObjectIp !== "") {
            fileContent += `auto enp0s3\niface enp0s3 inet static\n`;
            fileContent += `address ${networkObjectIp}\n`;
            fileContent += `netmask ${networkObjectNetmask}\n`;
            fileContent += `gateway ${networkObjectGateway}\n`;
        }
        //actualizamos el contenido del editor
        content.value = fileContent;
        fileEditorContainer.style.display = "block";

    } else {

        //añadimos el puntero al editor

        content.setAttribute("data-file", "/etc/network/interfaces");

        //obtenemos la información del objeto

        const $networkObject = document.getElementById(dataId);
        const networkObjectIps = [$networkObject.getAttribute("ip-enp0s3"), $networkObject.getAttribute("ip-enp0s8"), $networkObject.getAttribute("ip-enp0s9")];
        const networkObjectNetmasks = [$networkObject.getAttribute("netmask-enp0s3"), $networkObject.getAttribute("netmask-enp0s8"), $networkObject.getAttribute("netmask-enp0s9")];
        const interfaces = ["enp0s3", "enp0s8", "enp0s9"];

        //creamos el contenido del archivo

        let fileContent;
        fileContent = `#The loopback network interface\n`;
        fileContent += `\n`;

        //loopback

        fileContent += `auto lo\niface lo inet loopback\n`;
        fileContent += `\n`;

        //interfaces

        for (let i = 0; i < networkObjectIps.length; i++) {
            if (networkObjectIps[i] !== "") {
                fileContent += `\n`;
                fileContent += `auto ${interfaces[i]}\niface ${interfaces[i]} inet static\n`;
                fileContent += `address ${networkObjectIps[i]}\n`;
                fileContent += `netmask ${networkObjectNetmasks[i]}\n`;
                //rutas de enrutamiento
                fileContent += `\n`;
                fileContent += getRoutingRules(networkObjectId, interfaces[i]).join("\n");
                fileContent += `\n`;
            }
        }

        //actualizamos el contenido del editor
        content.value = fileContent;
        fileEditorContainer.style.display = "block";
    }

}

function parserNetworkFile() {

    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".pc-terminal").dataset.id);
    const interfaces = ["enp0s3", "enp0s8", "enp0s9"];
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");

    const lines = unfilteredlines
    .map(line => line.trim().replace(/\s+/g, " ")) //eliminamos los espacios duplicados
    .filter(line => line !== ""); //eliminamos las lineas vacias
    
    if (!$networkObject.id.startsWith("router-")) { //para los hosts

        for (let i = 0; i < lines.length; i++) {

            if (lines[i].startsWith("auto enp0s3")) { //miramos las 4 siguientes lineas

                if (lines[i + 1] === "iface enp0s3 inet static") {

                    if (!lines[i + 2].match(/^address \S+$/)) {
                        throw new Error(`Error en la línea ${i + 2}: formato no válido.`);
                    }

                    if (!lines[i + 3].match(/^netmask \S+$/)) {
                        throw new Error(`Error en la línea ${i + 3}: formato no válido.`);
                    }

                    if (!lines[i + 4].match(/^gateway \S+$/)) {
                        throw new Error(`Error en la línea ${i + 4}: formato no válido.`);
                    }

                    let ip = lines[i + 2].split(" ")[1];
                    let netmask = lines[i + 3].split(" ")[1];
                    let gateway = lines[i + 4].split(" ")[1];

                    if (!isValidIp(ip)) {
                        throw new Error(`Error en la línea ${i + 2}: IP no válida.`);
                    }

                    if (!isValidIp(netmask)) {
                        throw new Error(`Error en la línea ${i + 3}: Netmask no válida.`);
                    }

                    if (!isValidIp(gateway) || getNetwork(gateway, netmask) !== getNetwork(ip, netmask)) {
                        throw new Error(`Error en la línea ${i + 4}: Gateway no válida.`);
                    }

                    $networkObject.setAttribute("data-ip", ip);
                    $networkObject.setAttribute("data-netmask", netmask);
                    $networkObject.setAttribute("data-gateway", gateway);
                    terminalMessage("El archivo se ha cargado correctamente.");
                    return;

                } else if (lines[i + 1] === "iface enp0s3 inet dhcp") {

                    $networkObject.setAttribute("data-dhcp", "true");
                    $networkObject.setAttribute("data-ip", "");
                    $networkObject.setAttribute("data-netmask", "");
                    $networkObject.setAttribute("data-gateway", "");

                } else {

                    throw new Error(`Error en la línea ${i + 1}: formato no válido.`);
                }

                return;
            }
        }

    } else {

        //para los routers

        const routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
        const rows = routingTable.querySelectorAll("tr");

        for (let i = 0; i < lines.length; i++) {

            for (let interface = 0; interface < interfaces.length; interface++) {

                if (lines[i] === `auto ${interfaces[interface]}` && lines[i + 1] === `iface ${interfaces[interface]} inet static`) {

                    //buscamos la direccion ip y mascara de red

                    if (!lines[i + 2].match(/^address \S+$/)) {
                        throw new Error(`Error en la línea ${i + 2}: formato no válido.`);
                    }

                    if (!lines[i + 3].match(/^netmask \S+$/)) {
                        throw new Error(`Error en la línea ${i + 3}: formato no válido.`);
                    }

                    let ip = lines[i + 2].split(" ")[1];

                    let netmask = lines[i + 3].split(" ")[1];

                    if (!isValidIp(ip)) {
                        throw new Error(`Error en la línea ${i + 2}: IP no válida.`);
                    }

                    if (!isValidIp(netmask)) {
                        throw new Error(`Error en la línea ${i + 3}: Netmask no válida.`);
                    }

                    $networkObject.setAttribute(`ip-${interfaces[interface]}`, ip);
                    $networkObject.setAttribute(`netmask-${interfaces[interface]}`, netmask);
                    rows[interface + 1].querySelectorAll("td")[0].innerText = getNetwork(ip, netmask);
                    rows[interface + 1].querySelectorAll("td")[1].innerText = netmask;
                    rows[interface + 1].querySelectorAll("td")[2].innerText = ip;
                    rows[interface + 1].querySelectorAll("td")[3].innerText = interfaces[interface];

                    //ahora buscamos las reglas de enrutamiento

                    let j = i + 4;

                    while (j < lines.length && lines[j].startsWith("ip route add")) { //ip route add destination/netmask via nexthop

                        let destinationCidr; let nextHop; let [destination, destinationNetmask] = [];

                        //destino y mascara de red

                        destinationCidr = lines[j].split(" ")[3];

                        if (!isValidCidrIp(destinationCidr)) {
                            throw new Error(`Error en la líneas ${j}: dirección IP en CIDR no válida.`)
                        }

                        [destination, destinationNetmask] = parseCidr(lines[j].split(" ")[3]);

                        //compruebo que exista la palabra clave "via"

                        if (lines[j].split(" ")[4] !== "via") {
                            throw new Error(`Error en la línea ${j}: se esperaba 'via' `);
                        }

                        //siguiente salto

                        nextHop = lines[j].split(" ")[5];

                        if (!isValidIp(nextHop) || getNetwork(nextHop, netmask) !== getNetwork(ip, netmask)) {
                            throw new Error(`Error en la línea ${j}: siguiente salto no válido.`);
                        }

                        //si se cumple todo esto

                        addRoutingEntry($networkObject.id, destination, destinationNetmask, interfaces[interface], nextHop);
                        j++;

                    }

                    terminalMessage("El archivo se ha cargado correctamente.");

                }
            }
        }

    }

}

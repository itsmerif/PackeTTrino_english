function loadNetworkFile(dataId) {

    const fileEditorContainer = document.querySelector(".editor-container");
    const networkObjectId = document.querySelector(".terminal-component").dataset.id;
    let content = fileEditorContainer.querySelector(".file-editor");
    content.setAttribute("data-file", "/etc/network/interfaces");

    if (!networkObjectId.startsWith("router-")) {

        const $networkObject = document.getElementById(dataId);
        const networkObjectIp = $networkObject.getAttribute("data-ip");
        const isDhcpOn = $networkObject.getAttribute("dhclient") === "true";
        const networkObjectNetmask = $networkObject.getAttribute("data-netmask");
        const networkObjectGateway = $networkObject.getAttribute("data-gateway");

        let fileContent;

        fileContent = `#The loopback network interface\n`;
        fileContent += `\n`;
        fileContent += `auto lo\niface lo inet loopback\n`;
        fileContent += `\n`;
        fileContent += `# The primary network interface\n`;
        fileContent += `\n`;

        if (networkObjectIp !== "" && !isDhcpOn) {
            fileContent += `auto enp0s3\niface enp0s3 inet static\n`;
            fileContent += `address ${networkObjectIp}\n`;
            fileContent += `netmask ${networkObjectNetmask}\n`;
            if (networkObjectGateway) fileContent += `gateway ${networkObjectGateway}\n`;
        }

        if (isDhcpOn) {
            fileContent += `auto enp0s3\niface enp0s3 inet dhcp\n`;
        }

        content.value = fileContent;
        fileEditorContainer.style.display = "block";
        return;

    }


    const $networkObject = document.getElementById(dataId);
    const networkObjectIps = [$networkObject.getAttribute("ip-enp0s3"), $networkObject.getAttribute("ip-enp0s8"), $networkObject.getAttribute("ip-enp0s9")];
    const networkObjectNetmasks = [$networkObject.getAttribute("netmask-enp0s3"), $networkObject.getAttribute("netmask-enp0s8"), $networkObject.getAttribute("netmask-enp0s9")];
    const interfaces = ["enp0s3", "enp0s8", "enp0s9"];

    let fileContent;

    fileContent = `#The loopback network interface\n`;
    fileContent += `\n`;
    fileContent += `auto lo\niface lo inet loopback\n`;
    fileContent += `\n`;

    for (let i = 0; i < networkObjectIps.length; i++) {
        if (networkObjectIps[i] !== "") {
            fileContent += `\n`;
            fileContent += `auto ${interfaces[i]}\niface ${interfaces[i]} inet static\n`;
            fileContent += `address ${networkObjectIps[i]}\n`;
            fileContent += `netmask ${networkObjectNetmasks[i]}\n`;
            fileContent += `\n`;
            fileContent += getRoutingRules(networkObjectId, interfaces[i]).join("\n");
            fileContent += `\n`;
        }
    }

    content.value = fileContent;
    fileEditorContainer.style.display = "block";

}

function parserNetworkFile() {

    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const interfaces = ["enp0s3", "enp0s8", "enp0s9"];
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");
    const lines = unfilteredlines.map(line => line.trim().replace(/\s+/g, " ")).filter(line => line !== "");

    //para los hosts

    if (!$networkObject.id.startsWith("router-")) {

        for (let i = 0; i < lines.length; i++) {

            if (lines[i].startsWith("auto enp0s3")) {

                if (lines[i + 1] === "iface enp0s3 inet static") {

                    if (!lines[i + 2].match(/^address \S+$/)) throw new Error(`Error en la línea ${i + 2}: formato no válido.`);
                    if (!lines[i + 3].match(/^netmask \S+$/)) throw new Error(`Error en la línea ${i + 3}: formato no válido.`);

                    let ip = lines[i + 2].split(" ")[1];
                    let netmask = lines[i + 3].split(" ")[1];
                    let gateway = false;

                    if (lines[i + 4] && lines[i + 4].match(/^gateway/)) {
                        if (!lines[i + 4].match(/^gateway \S+$/)) throw new Error(`Error en la línea ${i + 4}: formato no válido.`);
                        gateway = lines[i + 4].split(" ")[1];
                    }

                    if (!isValidIp(ip)) throw new Error(`Error en la línea ${i + 2}: IP no válida.`);
                    if (!isValidIp(netmask)) throw new Error(`Error en la línea ${i + 3}: Netmask no válida.`);

                    if (gateway) {
                        if (!isValidIp(gateway)) throw new Error(`Error en la línea ${i + 4}: Gateway no válida.`);
                        if (getNetwork(gateway, netmask) !== getNetwork(ip, netmask)) throw new Error(`Error en la línea ${i + 4}: Gateway Inalcanzable.`);
                    }

                    $networkObject.setAttribute("data-ip", ip);
                    $networkObject.setAttribute("data-netmask", netmask);
                    if (gateway) $networkObject.setAttribute("data-gateway", gateway);
                    terminalMessage("El archivo se ha cargado correctamente.");
                    return;

                }

                if (lines[i + 1] === "iface enp0s3 inet dhcp") {
                    $networkObject.setAttribute("dhclient", "true");
                    terminalMessage("El archivo se ha cargado correctamente.");
                    return;
                }

                throw new Error(`Error en la línea ${i + 1}: formato no válido.`);

            }
        }

        return
    }

    //para los routers

    const routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    let routingRules = [];
    let ips = {};
    let netmasks = {};
    let i = 0;

    while (i < lines.length) {

        while (lines[i].startsWith("auto") && !lines[i].startsWith("auto lo")) { 

            let networkInterface = lines[i].split(" ")[1];

            if (!interfaces.includes(networkInterface)) throw new Error(`Error en la línea ${i}: interface no reconocida.`);

            let regExForInterface = new RegExp(`^iface ${networkInterface} inet static`);

            if (!lines[i + 1].match(regExForInterface)) throw new Error(`Error en la línea ${i + 1}: formato no válido.`);

            if (!lines[i + 2].match(/^address \S+$/)) throw new Error(`Error en la línea ${i + 2}: formato no válido.`);

            if (!lines[i + 3].match(/^netmask \S+$/)) throw new Error(`Error en la línea ${i + 3}: formato no válido.`);

            let ip = lines[i + 2].split(" ")[1];
            let netmask = lines[i + 3].split(" ")[1];
            
            if (!isValidIp(ip)) throw new Error(`Error en la línea ${i + 2}: IP no válida.`);

            if (!isValidIp(netmask)) throw new Error(`Error en la línea ${i + 3}: Netmask no válida.`);

            ips[networkInterface] = ip;
            netmasks[networkInterface] = netmask;

            let j = i + 4;

            while (j < lines.length && lines[j].startsWith("ip route add")) {

                let destinationCidr;
                let nextHop;
                let [destination, destinationNetmask] = [];

                destinationCidr = lines[j].split(" ")[3];

                if (!isValidCidrIp(destinationCidr)) throw new Error(`Error en la líneas ${j}: dirección IP en CIDR no válida.`)

                [destination, destinationNetmask] = parseCidr(lines[j].split(" ")[3]);

                if (lines[j].split(" ")[4] !== "via") throw new Error(`Error en la línea ${j}: se esperaba 'via' `);

                nextHop = lines[j].split(" ")[5];

                if (!isValidIp(nextHop) || getNetwork(nextHop, netmask) !== getNetwork(ip, netmask)) throw new Error(`Error en la línea ${j}: siguiente salto no válido.`);

                let rule = new routingRule(destination, destinationNetmask, networkInterface, nextHop);
                routingRules.push(rule);

                j++;

            }

            i = j;

        }

        i++;
        
    }

    for (let rule of routingRules) {
        addRoutingEntry($networkObject.id, rule.destination, rule.destinationNetmask, rule.interface, rule.nextHop);
    }

    let rowNumber = 1;

    for (let ip in ips) {
        $networkObject.setAttribute(`ip-${ip}`, ips[ip]);
        $networkObject.setAttribute(`netmask-${ip}`, netmasks[ip]);
        rows[1].querySelectorAll("td")[0].innerText = getNetwork(ips[ip], netmasks[ip]);
        rows[1].querySelectorAll("td")[1].innerText = netmasks[ip];
        rows[1].querySelectorAll("td")[2].innerText = ips[ip];
        rows[1].querySelectorAll("td")[3].innerText = ip;
        rowNumber++;
    }
}

class routingRule {
    constructor(destination, destinationNetmask, networkInterface, nextHop) {
        this.destination = destination;
        this.destinationNetmask = destinationNetmask;
        this.interface = networkInterface;
        this.nextHop = nextHop;
    }
}

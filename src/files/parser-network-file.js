class networkChange {
    constructor() {
        this.networkInterface = "";
        this.type = "";
        this.ip = "";
        this.netmask = "";
        this.gateway = "";
    }
}

class routingRule {
    constructor() {
        this.destination = "";
        this.netmask = "";
        this.nextHop = "";
    }
}

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
        fileContent = `#The primary network interface\n`;
        fileContent += `\n`;

        if (networkObjectIp !== "" && !isDhcpOn) {
            fileContent += `auto enp0s3\niface enp0s3 inet static\n`;
            fileContent += `address ${networkObjectIp}\n`;
            fileContent += `netmask ${networkObjectNetmask}\n`;
            if (networkObjectGateway) fileContent += `gateway ${networkObjectGateway}\n`;
        }

        if (isDhcpOn) fileContent += `auto enp0s3\niface enp0s3 inet dhcp\n`;

        content.value = fileContent;
        fileEditorContainer.style.display = "block";

    } else {

        const $networkObject = document.getElementById(dataId);
        const networkObjectIps = [$networkObject.getAttribute("ip-enp0s3"), $networkObject.getAttribute("ip-enp0s8"), $networkObject.getAttribute("ip-enp0s9")];
        const networkObjectNetmasks = [$networkObject.getAttribute("netmask-enp0s3"), $networkObject.getAttribute("netmask-enp0s8"), $networkObject.getAttribute("netmask-enp0s9")];
        const interfaces = ["enp0s3", "enp0s8", "enp0s9"];
    
        let fileContent;

        fileContent = `#The primary network interface\n`;
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

}

function parserNetworkFile() {

    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const networkInterfacesStrategy = {
        "host": ["enp0s3"],
        "router": ["enp0s3", "enp0s8", "enp0s9"]
    };
    const interfaceTypes = ["dhcp", "static"];
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");
    const lines = unfilteredlines.map(line => line.trim().replace(/\s+/g, " ")).filter(line => line !== "");
    const availableInterfaces = networkInterfacesStrategy[$networkObject.id.startsWith("router-") ? "router" : "host"];

    let networkChanges = [];
    let routingRules = [];

    let i = 0;

    while (i < lines.length) {

        if (lines[i].startsWith("auto ")) {

            let $networkUpdate = new networkChange();

            //interfaz
            let networkInterface = lines[i].split(" ")[1];
            if (!availableInterfaces.includes(networkInterface)) throw new Error(`Error: interfaz ${networkInterface} no reconocida.`);
            $networkUpdate.networkInterface = networkInterface;

            //tipo de interfaz
            if (!lines[i + 1].startsWith(`iface ${networkInterface} inet`)) throw new Error(`Error: formato no válido cerca de la línea ${i + 1}.`);
            let $interfaceType = lines[i + 1].split(" ")[3];
            if (!interfaceTypes.includes($interfaceType)) throw new Error(`Error: tipo de interfaz ${$interfaceType} no reconocido.`);
            $networkUpdate.type = $interfaceType;

            //ip
            if (!lines[i + 2].startsWith("address ")) throw new Error(`Error: formato no válido cerca de la línea ${i + 2}.`);
            let ip = lines[i + 2].split(" ")[1];
            if (!isValidIp(ip)) throw new Error(`Error: ${ip} no es una dirección IP válida.`);
            $networkUpdate.ip = ip;

            //netmask
            if (!lines[i + 3].startsWith("netmask ")) throw new Error(`Error: formato no válido cerca de la línea ${i + 3}.`);
            let netmask = lines[i + 3].split(" ")[1];
            if (!isValidIp(netmask)) throw new Error(`Error: ${netmask} no es una máscara de red válida.`);
            $networkUpdate.netmask = lines[i + 3].split(" ")[1];

            let nextLine = i + 4;

            //gateway(opcional)
            if (lines[i + 4] && lines[i + 4].startsWith("gateway ")) {
                let gateway = lines[i + 4].split(" ")[1];
                if (!isValidIp(gateway)) throw new Error(`Error: ${gateway} no es una dirección IP válida.`);
                if (getNetwork(gateway, netmask) !== getNetwork(ip, netmask)) throw new Error(`Error: puerta de enlace ${gateway} inalcanzable.`);
                $networkUpdate.gateway = gateway;
                nextLine++;
            }

            networkChanges.push($networkUpdate);

            i = nextLine;

        }else if (lines[i].startsWith("ip route add ")) {

            let $routingRule = new routingRule();

            //destino
            let destination = lines[i].split(" ")[3];
            if (!isValidCidrIp(destination)) throw new Error(`Error: ${destination} no es una dirección CIDR válida.`);
            $routingRule.destination = parseCidr(destination)[0];
            $routingRule.netmask = parseCidr(destination)[1];
            let nextHop = lines[i].split(" ")[5];
            if (!isValidIp(nextHop)) throw new Error(`Error: ${nextHop} no es una dirección IP válida.`);
            $routingRule.nextHop = nextHop;

            routingRules.push($routingRule);
            i++;

        } else {
            i++;
        }
    }

    setNetworkChanges(networkChanges, $networkObject);

}

function setNetworkChanges(networkChanges, $networkObject) {

    networkChanges.forEach(networkChange => {

        const setNetworkSpecsStrategy = {

            "enp0s3": () => {
                if ($networkObject.getAttribute("data-ip") === null) {
                    $networkObject.setAttribute("ip-enp0s3", networkChange.ip);
                    $networkObject.setAttribute("netmask-enp0s3", networkChange.netmask);
                }else {
                    $networkObject.setAttribute("data-ip", networkChange.ip);
                    $networkObject.setAttribute("data-netmask", networkChange.netmask);
                    if (networkChange.gateway !== "") $networkObject.setAttribute("data-gateway", networkChange.gateway);
                }
            },

            "enp0s8": () => {
                $networkObject.setAttribute("ip-enp0s8", networkChange.ip);
                $networkObject.setAttribute("netmask-enp0s8", networkChange.netmask);
            },

            "enp0s9": () => { 
                $networkObject.setAttribute("ip-enp0s9", networkChange.ip);
                $networkObject.setAttribute("netmask-enp0s9", networkChange.netmask);
            }

        };

        setNetworkSpecsStrategy[networkChange.networkInterface]();

    });

}
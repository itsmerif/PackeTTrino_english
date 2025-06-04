function dhcpdConfInterpreter(networkObjectId, content)  {

    const $networkObject = document.getElementById(networkObjectId);

    //eliminamos las lineas comentadas
    const contentWithoutComments = content
    .split("\n")
    .map(line => line.trim())
    .filter(line => !line.startsWith("#"))
    .join("\n");

    //quitamos los saltos de línea y los espacios
    const filteredContent = contentWithoutComments
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

    //obtenemos los bloques SHARED-NETWORK
    const sharedNetworkBlocks = filteredContent
    .split("shared-network")
    .map(line => (`shared-network ${line}`).replace(/\s+/g, " ")
    .trim())
    .slice(1);
    
    sharedNetworkBlocks.forEach(sharedNetworkBlock => {

        const tokens = sharedNetworkBlock.split(" ");
        const sharedNetworkName = tokens[1];
        const subnetBlocks = sharedNetworkBlock.split("subnet ").map(line => (`subnet ${line}`).replace(/\s+/g, " ").trim()).slice(1);
               
        subnetBlocks.forEach(subnetBlock => {
            
            const instructions = (subnetBlock.split("{")[1].split("}")[0]).split(";").map(option => option.trim()).filter(option => option !== "");

            const subnetObject = {
                "rangeStart": "",
                "rangeEnd": "",
                "netmask": "",
                "routers": "",
                "domain-name-servers": "",
                "lease-time": ""
            }
           
            instructions.forEach(instruction => {

                const tokens = instruction.split(" ");

                const optionsMap = {

                    "range": () => {
                        subnetObject["rangeStart"] = tokens[1];
                        subnetObject["rangeEnd"] = tokens[2];
                    },

                    "option subnet-mask": () => {
                        subnetObject["netmask"] = tokens[2];
                    },

                    "option routers": () => {
                        subnetObject["routers"] = tokens[2];
                    },

                    "option domain-name-servers": () => {
                        subnetObject["domain-name-servers"] = tokens[2];
                    },

                    "lease-time": () => {
                        subnetObject["lease-time"] = tokens[1];
                    },

                }

                for (let option in optionsMap) if (instruction.startsWith(option)) optionsMap[option]();

            });

            //ahora validamos los campos

            if (!isValidIp(subnetObject["rangeStart"])) throw new Error(`Error: La IP inicial "${subnetObject["rangeStart"]}" no es válida`);
            if (!isValidIp(subnetObject["rangeEnd"])) throw new Error(`Error: La IP final "${subnetObject["rangeEnd"]}" no es válida`);
            if (!isValidIp(subnetObject["netmask"])) throw new Error(`Error: La mascara de red "${subnetObject["netmask"]}" no es válida`);
            if (!isValidIp(subnetObject["routers"])) throw new Error(`Error: La IP de enrutamiento "${subnetObject["routers"]}" no es válida`);
            if (!isValidIp(subnetObject["domain-name-servers"])) throw new Error(`Error: La IP de servidores de dominio "${subnetObject["domain-name-servers"]}" no es válida`);
            if (isNaN(subnetObject["lease-time"])) throw new Error(`Error: El tiempo de alquiler "${subnetObject["lease-time"]}" no es válido`);

            //aplicamos los cambios

            $networkObject.setAttribute("data-range-start", subnetObject["rangeStart"]);
            $networkObject.setAttribute("data-range-end", subnetObject["rangeEnd"]);
            $networkObject.setAttribute("dhcp-offer-netmask", subnetObject["netmask"]);
            $networkObject.setAttribute("dhcp-offer-gateway", subnetObject["routers"]);
            $networkObject.setAttribute("dhcp-offer-dns", subnetObject["domain-name-servers"]);
            $networkObject.setAttribute("dhcp-offer-lease-time", subnetObject["lease-time"]);

        });

    });

    const hostBlocks = filteredContent.split("host").map(line => (`host ${line}`).replace(/\s+/g, " ").trim()).slice(1);

    hostBlocks.forEach(hostBlock => {

        const instructions = (hostBlock.split("{")[1].split("}")[0]).split(";").map(option => option.trim()).filter(option => option !== "");

        const hostObject = {
            "mac": "",
            "reservedIp": ""
        }

        instructions.forEach(instruction => {

            const tokens = instruction.split(" ");

            const optionsMap = {

                "hardware ethernet": () => {
                    hostObject["mac"] = tokens[2];
                },

                "fixed-address": () => {
                    hostObject["reservedIp"] = tokens[1];
                },

            }

            for (let option in optionsMap) if (instruction.startsWith(option)) optionsMap[option]();

        });

        //ahora validamos los campos

        if (!isValidMac(hostObject["mac"])) throw new Error(`Error: La mac "${hostObject["mac"]}" no es válida`);
        if (!isValidIp(hostObject["reservedIp"])) throw new Error(`Error: La IP "${hostObject["reservedIp"]}" no es válida`);

        const offerNetmask = $networkObject.getAttribute("dhcp-offer-netmask");
        const rangeStart = $networkObject.getAttribute("data-range-start");
        
        if (getNetwork(hostObject["reservedIp"], offerNetmask) !== getNetwork(rangeStart, offerNetmask)) 
            throw new Error(`Error: La IP "${hostObject["reservedIp"]}" no pertenece al rango de servicio del servidor DHCP.`);
        addDhcpReservation(networkObjectId, hostObject["mac"], hostObject["reservedIp"]);

    });
}
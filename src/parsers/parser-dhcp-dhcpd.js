function dhcpdFileInterpreter(networkObjectId, content)  {

    const $networkObject = document.getElementById(networkObjectId);
    const filteredContent = content.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    const sharedNetworkBlocks = filteredContent.split("shared-network").map(line => (`shared-network ${line}`).replace(/\s+/g, " ").trim()).slice(1);
    
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
            $networkObject.setAttribute("offer-netmask", subnetObject["netmask"]);
            $networkObject.setAttribute("offer-gateway", subnetObject["routers"]);
            $networkObject.setAttribute("offer-dns", subnetObject["domain-name-servers"]);
            $networkObject.setAttribute("offer-lease-time", subnetObject["lease-time"]);

        });

    });

}
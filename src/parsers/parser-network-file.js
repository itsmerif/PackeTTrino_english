function parseInterfacesFile(networkObjectId, content) {
    
    const availableInterfaces = getInterfaces(networkObjectId); //<-- obtenemos las interfaces disponibles del dispositivo
    const filteredContent = content.replace(/\n/g, " ").replace(/\s+/g, " ").trim(); //<- quitamos los saltos de línea y los espacios
    const instructions = filteredContent.split("iface").map( line => (`iface ${line}`).replace(/\s+/g, " ").trim()).slice(1); //<-- obtenemos las instrucciones de red del archivo
    
    instructions.forEach(instruction => { //<-- evaluamos cada instrucción

        const interfaceObject = { //<-- inicializamos el objeto de análisis
            "iface": "",
            "inet": "",
            "address": "",
            "netmask": "",
            "gateway": ""
        }

        const tokens = (`int ${instruction}`).split(" "); //<-- dividimos la instrucción en tokens, añadimos un prefijo para que el parser de opciones pueda funcionar

        const $OPTS = catchopts([ //<-- obtenemos las opciones de la instrucción y sus valores
            "iface:", 
            "inet:", 
            "address:", 
            "netmask:", 
            "gateway:"
        ], tokens);

        const optionsHandler = { //<-- definimos el manejador de las opciones
            "iface": () => { interfaceObject["iface"] = $OPTS["iface"]; },
            "inet": () => { interfaceObject["inet"] = $OPTS["inet"]; },
            "address": () => { interfaceObject["address"] = $OPTS["address"]; },
            "netmask": () => { interfaceObject["netmask"] = $OPTS["netmask"]; },
            "gateway": () => { interfaceObject["gateway"] = $OPTS["gateway"]; }
        }

        for (let option in $OPTS) if (optionsHandler[option]) optionsHandler[option](); //<-- ejecutamos el manejador de las opciones por cada opción

        //<-- evaluamos las opciones de la instrucción
        if (!availableInterfaces.includes(interfaceObject["iface"])) throw new Error(`Error: no se reconoce la interfaz ${interfaceObject["iface"]}`);
        if (!["static", "dhcp"].includes(interfaceObject["inet"])) throw new Error(`Error: no se reconoce el tipo de red ${interfaceObject["inet"]}`);
        if (!isValidIp(interfaceObject["address"])) throw new Error(`Error: la ip ${interfaceObject["address"]} no es válida`);
        if (!isValidIp(interfaceObject["netmask"])) throw new Error(`Error: la mascara de red ${interfaceObject["netmask"]} no es válida`);
        if ( interfaceObject["gateway"] !== "" && !isValidIp(interfaceObject["gateway"])) throw new Error(`Error: la puerta de enlace ${interfaceObject["gateway"]} no es válida`);

        //<-- configuramos la interfaz si el metodo es static
        if (interfaceObject["inet"] === "static") {

            configureInterface(networkObjectId, //<-- configuramos la interfaz
                interfaceObject["address"], 
                interfaceObject["netmask"], 
                interfaceObject["iface"]
            );

            setDirectRoutingRule(networkObjectId, //<-- añadimos la regla de enrutamiento directo
                interfaceObject["address"], 
                interfaceObject["netmask"], 
                interfaceObject["iface"]
            );

            if (interfaceObject["gateway"] !== "") {

                document.getElementById(networkObjectId).setAttribute("data-gateway", interfaceObject["gateway"]); //<-- configuramos la puerta de enlace

                setRemoteRoutingRule(networkObjectId, //<-- añadimos la regla por defecto
                    "0.0.0.0", 
                    "0.0.0.0",
                    interfaceObject["address"], //<-- salida
                    interfaceObject["iface"],  //<-- interfaz
                    interfaceObject["gateway"] //<-- siguiente salto
                );

            }

        }

    });

}
 
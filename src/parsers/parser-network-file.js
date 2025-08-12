/***
 * DIFERENCIAS CON EL FUNCIONAMIENTO HABITUAL EN LINUX:
 * -a NO REPRESENTA LAS LINEAS "AUTO", REPRESENTA TODAS LAS INTERFACES (--all)
 * LOS BLOQUES DE INSTRUCCIONES COMIENZAN POR "iface" Y DEBEN SER EN LA FORMA "iface <INTERFAZ> inet <TIPO> address <IP> netmask <MASCARA> gateway <IP>"
 * NO SE USAN LAS INSTUCCIONES "AUTO <INTERFAZ>"
 * LAS REGLAS DE ENRUTAMIENTO DEBEN SER EN LA FORMA "ip route add <IP_DESTINO>/<MASCARA_DESTINO> via <IP_NEXTHOP>"
 * LAS REGLAS DE ENRUTAMIENTO NO COMIENZAN POR "up" o "down"
 * LAS REGLAS DE ENRUTAMIENTO SIEMPRE LLEVAN "add"
*/

async function interfacesFileInterpreter(networkObjectId, content, interfaceInput) {
    
    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId); //<-- obtenemos las interfaces disponibles del dispositivo

    //quitamos las lineas comentadas
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

    //obtenemos los bloques IFACE
    const ifaceBlocks = filteredContent
    .split("iface")
    .map(line => (`iface ${line}`).replace(/\s+/g, " ")
    .trim())
    .slice(1);
    
    // <-- ejemplo de instruccion: iface enp0s3 inet static address 192.168.1.100 netmask 255.255.255.0 gateway 192.168.1.1

    for (let ifaceBlock of ifaceBlocks) {
        
        const interfaceObject = { //<-- inicializamos el objeto de análisis
            "iface": "",
            "inet": "",
            "address": "",
            "netmask": "",
            "gateway": ""
        }

        const tokens = (`int ${ifaceBlock}`).split(" "); //<-- dividimos la instrucción en tokens, añadimos un prefijo para que el parser de opciones pueda funcionar

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

        for (let option in $OPTS) if (optionsHandler[option]) optionsHandler[option]();
       
        if (!availableInterfaces.includes(interfaceObject["iface"])) {
            throw new Error(`Error: no se reconoce la interfaz ${interfaceObject["iface"]}`);
        }

        if (!["static", "dhcp"].includes(interfaceObject["inet"])) {
            throw new Error(`Error: no se reconoce el tipo de red ${interfaceObject["inet"]}`); 
        }
        
        if (interfaceInput !== "-a" && interfaceInput !== interfaceObject["iface"]) continue;

        if (interfaceObject["inet"] === "static") {

            if (!isValidIp(interfaceObject["address"])) {
                throw new Error(`Error: la ip ${interfaceObject["address"]} no es válida`);
            }

            if (!isValidIp(interfaceObject["netmask"])) {
                throw new Error(`Error: la mascara de red ${interfaceObject["netmask"]} no es válida`);
            }

            if (interfaceObject["gateway"] !== "" && !isValidIp(interfaceObject["gateway"])) {
                throw new Error(`Error: la puerta de enlace ${interfaceObject["gateway"]} no es válida`);
            }

            configureInterface(networkObjectId,
                interfaceObject["address"], 
                interfaceObject["netmask"], 
                interfaceObject["iface"]
            );

            if (interfaceObject["gateway"] !== "") setDefaultGateway(networkObjectId, interfaceObject["gateway"]);

        }

        if (interfaceObject["inet"] === "dhcp") {

            if ($networkObject.getAttribute("dhclient") !== "true") {
                throw new Error(`Error: el equipo no tiene instalado el servicio DHCP cliente.\nPista -> apt install isc-dhcp-client`);
            }

            $networkObject.setAttribute(`data-dhclient-${interfaceObject["iface"]}`, "true");
        
            await dhcpDiscoverHandler(networkObjectId, interfaceObject["iface"]);
            
            continue;

        }

        const routingInstructions = ifaceBlock.split("ip").map(rule => (`ip ${rule}`).replace(/\s+/g, " ").trim()).slice(1);

        routingInstructions.forEach(routingInstruction => {

            const tokens = routingInstruction.split(" "); //<--obtenemos los tokens de la instrucción ip route
            const destinationCIDR = tokens[3]; 
            const nexthop = tokens[5];

            if (!isValidCidrIp(destinationCIDR)) throw new Error(`Error: direccion IP ${destinationCIDR} no válida`);

            const [destinationIp, netmaskIp] = parseCidr(destinationCIDR);

            if (getNetwork(destinationIp, netmaskIp) !== destinationIp) {
                throw new Error(`Error: dirección IP ${destinationCIDR} no es una dirección de red`);
            }

            if (!isValidIp(nexthop)) throw new Error(`Error: dirección IP ${nexthop} no válida`);

            if (getNetwork(nexthop, interfaceObject["netmask"]) !== getNetwork(interfaceObject["address"], interfaceObject["netmask"])) {
                throw new Error(`Error: dirección IP ${nexthop} no es accesible`);
            }

            setRemoteRoutingRule(networkObjectId,
                destinationIp, //<-- red de destino
                netmaskIp, //<-- mascara de red
                interfaceObject["address"], //<-- ip de salida
                interfaceObject["iface"], //<-- interfaz
                nexthop //<-- siguiente salto
            );

        });

    };

}
 

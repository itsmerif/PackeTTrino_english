/***

* DIFFERENCES FROM NORMAL LINUX OPERATION:

* -a DOES NOT REPRESENT THE "AUTO" LINES, IT REPRESENTS ALL INTERFACES (--all)

* INSTRUCTION BLOCKS BEGIN WITH "iface" AND MUST BE IN THE FORM "iface <INTERFACE> inet <TYPE> address <IP> netmask <MASK> gateway <IP>"

* THE "AUTO <INTERFACE>" INSTRUCTIONS ARE NOT USED

* ROUTING RULES MUST BE IN THE FORM "ip route add <DESTINATION_IP>/<DESTINATION_MASK> via <NEXTHOP_IP>"

* ROUTING RULES DO NOT BEGIN WITH "up" or "down"

* ROUTING RULES ALWAYS INCLUDE "add"
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
                throw new Error(`Error: The default gateway ${interfaceObject["gateway"]} is invalid`);
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
                throw new Error(`Error: The device does not have the DHCP client service installed.\nHint -> apt install isc-dhcp-client`);
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

            if (!isValidCidrIp(destinationCIDR)) throw new Error(`Error: IP Address ${destinationCIDR} is invalid`);

            const [destinationIp, netmaskIp] = parseCidr(destinationCIDR);

            if (getNetwork(destinationIp, netmaskIp) !== destinationIp) {
                throw new Error(`Error: IP address ${destinationCIDR} is not a network address`);
            }

            if (!isValidIp(nexthop)) throw new Error(`Error: IP Address ${nexthop} is invalid`);

            if (getNetwork(nexthop, interfaceObject["netmask"]) !== getNetwork(interfaceObject["address"], interfaceObject["netmask"])) {
                throw new Error(`Error: IP Address ${nexthop} is not reachable`);
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
 

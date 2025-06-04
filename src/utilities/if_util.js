/**ESTE COMANDO CONFIGURA INTERFACES A PARTIR DEL ARCHIVO INTERFACES */
function command_ifup(networkObjectId, interfaceInput)  {

    if (!interfaceInput) terminalMessage("Error: no se especificó una interfaz", networkObjectId);
    if (interfaceInput !== "-a" && !getInterfaces(networkObjectId).includes(interfaceInput)) terminalMessage(`Error: no se reconoce la interfaz ${interfaceInput}`, networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const networkElementFileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder("/etc/network/interfaces");
    let fileName = directoryPath.pop();

    try {
        let interfacesContent = networkElementFileSystem.read(fileName, directoryPath); //<-- recuperamos el contenido del archivo interfaces
        interfacesFileInterpreter(networkObjectId, interfacesContent, interfaceInput); //<-- parseamos e interpretamos el contenido del archivo
    } catch (e) {
        terminalMessage(e.message, networkObjectId);
    }

}

/**ESTE COMANDO DESCONFIGURA INTERFACES (OJO, NO USA EL ARCHIVO INTERFACES)*/
function command_ifdown(networkObjectId, interfaceInput)  {

    if (!interfaceInput) terminalMessage("Error: no se especificó una interfaz", networkObjectId);
    if (interfaceInput !== "-a" && !getInterfaces(networkObjectId).includes(interfaceInput)) terminalMessage(`Error: no se reconoce la interfaz ${interfaceInput}`, networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId); //<-- obtenemos las interfaces disponibles del dispositivo
    
    availableInterfaces.forEach(availableInterface => {

        if (interfaceInput === "-a" || interfaceInput === availableInterface) {

            if ($networkObject.getAttribute("dhclient") === "true") {
                const networkObjectIp = $networkObject.getAttribute(`ip-${availableInterface}`);
                if (networkObjectIp) dhcpReleaseHandler(networkObjectId, availableInterface); //<-- en modo dhcp, se hace un release de la ip asignada
                return;
            }

            deconfigureInterface(networkObjectId, availableInterface); //<-- desconfiguramos la interfaz
            removeInterfaceRoutingRules(networkObjectId, availableInterface); //<-- eliminamos todas las reglas de enrutamiento asociadas a la interfaz
            $networkObject.setAttribute("data-gateway", ""); //<-- eliminamos la puerta de enlace (si existe)
            
        }

    });

}
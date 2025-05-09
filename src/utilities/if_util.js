/**ESTE COMANDO CONFIGURA INTERFACES A PARTIR DEL ARCHIVO INTERFACES */
function command_ifup(networkObjectId, interface)  {

    const $networkObject = document.getElementById(networkObjectId);
    const networkElementFileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder("/etc/network/interfaces");
    let fileName = directoryPath.pop();

    try {
        let interfacesContent = networkElementFileSystem.open(fileName, directoryPath); //<-- recuperamos el contenido del archivo interfaces
        parseInterfacesFile(networkObjectId, interfacesContent);
    } catch (e) {
        terminalMessage(e, networkObjectId);
        console.log(e);
    }

}

/**ESTE COMANDO DESCONFIGURA INTERFACES (OJO, NO USA EL ARCHIVO INTERFACES)*/
function command_ifdown(networkObjectId, interfaceInput)  {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId); //<-- obtenemos las interfaces disponibles del dispositivo
    let found = false; //<-- inicializamos el valor de la variable de búsqueda

    availableInterfaces.forEach(availableInterface => {

        if (interfaceInput === "-a" || interfaceInput === availableInterface) {
            deconfigureInterface(networkObjectId, availableInterface); //<-- desconfiguramos la interfaz
            removeInterfaceRoutingRules(networkObjectId, availableInterface); //<-- eliminamos todas las reglas de enrutamiento asociadas a la interfaz
            $networkObject.setAttribute("data-gateway", ""); //<-- eliminamos la puerta de enlace
            found = true;
        }

    });

    if (!found) terminalMessage(`Error: no se reconoce la interfaz ${interfaceInput}`, networkObjectId);

}
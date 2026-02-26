/**ESTE COMANDO CONFIGURA INTERFACES A PARTIR DEL ARCHIVO INTERFACES */
async function command_ifup(networkObjectId, interfaceInput)  {

    if (!interfaceInput) terminalMessage("Error: No interface was specified.", networkObjectId);
    if (interfaceInput !== "-a" && !getInterfaces(networkObjectId).includes(interfaceInput)) terminalMessage(`Error: The interface is not recognized ${interfaceInput}`, networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const networkElementFileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder("/etc/network/interfaces");
    let fileName = directoryPath.pop();

    try {
        let interfacesContent = networkElementFileSystem.read(fileName, directoryPath); 
        await interfacesFileInterpreter(networkObjectId, interfacesContent, interfaceInput);
    } catch (e) {
        terminalMessage(`ifup: ${e.message}`, networkObjectId);
    }

}

/**ESTE COMANDO DESCONFIGURA INTERFACES (OJO, NO USA EL ARCHIVO INTERFACES)*/
function command_ifdown(networkObjectId, interfaceInput)  {

    if (!interfaceInput) terminalMessage("Error: No interface was specified", networkObjectId);
    
    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);

    if (interfaceInput !== "-a" && !getInterfaces(networkObjectId).includes(interfaceInput)) {
        terminalMessage(`Error: Interface not recognized ${interfaceInput}`, networkObjectId);
    }

    availableInterfaces.forEach(availableInterface => {

        if (interfaceInput === "-a" || interfaceInput === availableInterface) {

            if ($networkObject.getAttribute("dhclient") === "true") {
                const networkObjectIp = $networkObject.getAttribute(`ip-${availableInterface}`);
                if (networkObjectIp) dhcpReleaseHandler(networkObjectId, availableInterface);
                return;
            }

            deconfigureInterface(networkObjectId, availableInterface);
          
        }

    });

}

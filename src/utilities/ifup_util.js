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

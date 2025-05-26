async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isApacheOn = $networkObject.getAttribute("apache2") === "true";

    if (!isApacheOn) return;

    const apacheContent = getApacheWebContent(networkObjectId, packet.dport, packet.destination_ip);

    if (!apacheContent) return;

    let newPacket = new httpReply(
        networkObjectIp, //ip del origen
        packet.origin_ip, //ip del destino
        networkObjectMac, //mac del origen
        packet.origin_mac, //mac del destino
        packet.dport, //puerto del origen
        packet.sport //puerto del destino
    );

    newPacket.body = apacheContent;

    return newPacket;

}

/**ESTA FUNCION DEVUELVE EL CONTENIDO DEL ARCHIVO INDEX.HTML DE UN DISPOSITIVO EN EL DIRECTORIO POR DEFECTO */

function getApacheWebContent(networkObjectId, requestedPort, requestedIp) {   
                                                              
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);

    try {

        const fileResponse = apacheSitesParser(networkObjectId);

        for (let site in fileResponse) {

            const isValidPort = parseInt(fileResponse[site].port) === parseInt(requestedPort);
            const isValidIp = fileResponse[site].ip === "*" || fileResponse[site].ip === requestedIp;
            const indexFile = fileResponse[site].directoryIndex;
            const documentRoot = fileResponse[site].documentRoot;

            if (isValidPort && isValidIp) {
                const directoryIndexContent = networkObjectFileSystem.read(indexFile, documentRoot.split("/").slice(1));
                return directoryIndexContent;
            }

        }

    }catch (e) {

        return; //TODO: crear un log en el sistema de ficheros para los errores

    }
 
}
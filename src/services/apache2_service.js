async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isApacheOn = $networkObject.getAttribute("apache2") === "true";

    if (!isApacheOn) return;

    const apacheContent = getApacheWebContent(networkObjectId, packet);

    if (!apacheContent) return;

    let newPacket = new httpReply(
        networkObjectIp, //ip del origen
        packet.origin_ip, //ip del destino
        networkObjectMac, //mac del origen
        packet.origin_mac, //mac del destino
        packet.dport, //puerto del origen
        packet.sport, //puerto del destino
        packet.method, //método
        packet.host //host
    );

    newPacket.body = apacheContent;

    return newPacket;

}

/**ESTA FUNCION DEVUELVE EL CONTENIDO DEL ARCHIVO INDEX.HTML DE UN DISPOSITIVO EN EL DIRECTORIO POR DEFECTO */

function getApacheWebContent(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    let fileResponse;

    //desglosamos el paquete

    const requestedPort = packet.dport;
    const requestedIp = packet.destination_ip;
    const method = packet.method;
    const host = packet.host;

    //parseamos el fichero de configuración de apache y obtenemos la información

    try {
        fileResponse = apacheSitesParser(networkObjectId);
    } catch (e) {
        return; //TODO: crear un log en el sistema de ficheros para los errores
    }

    //interpretamos la información obtenida

    for (let site in fileResponse) {

        const isValidPort = parseInt(fileResponse[site].port) === parseInt(requestedPort);
        const isValidIp = fileResponse[site].ip === "*" || fileResponse[site].ip === requestedIp;
        const isValidServerName = fileResponse[site].serverName === host || !fileResponse[site].serverName;

        if (isValidPort && isValidIp && isValidServerName) {

            const indexFile = fileResponse[site].directoryIndex;
            const documentRoot = fileResponse[site].documentRoot;
            const serverName = fileResponse[site].serverName;
            const indexesAllowed = fileResponse[site].indexesAllowed;

            //intentamos obtener el contenido del index.html

            try {
                const directoryIndexContent = networkObjectFileSystem.read(indexFile, documentRoot.split("/").slice(1));
                return directoryIndexContent;
            }catch (e) {
                //TODO: crear un log en el sistema de ficheros para los errores
            }

            //si no se pudo obtener el index.html, intentamos mostrar el índice del directorio

            const directoryIndexFiles = networkObjectFileSystem.ls("-R").split(" ").filter(el => el.startsWith(`${documentRoot}/`)).map(el => el.split(`${documentRoot}/`)[1]);

            return (indexesAllowed === true) ? $DIRECTORYINDEXCONTENT(documentRoot, directoryIndexFiles) : $FORBIDDENCONTENT;

        }

    }

}
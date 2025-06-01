async function apache_service(networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const isApacheOn = $networkObject.getAttribute("apache2") === "true";

    if (!isApacheOn) return;

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

    //desglosamos el paquete

    const networkObjectFileSystem = new FileSystem($networkObject);
    const requestedPort = packet.dport;
    const requestedIp = packet.destination_ip;
    const requestedResource = packet.resource;
    const method = packet.method;
    const host = packet.host;
    let codeError;
    let fileResponse;
    let apacheContent;

    //parseamos el fichero de configuración de apache y obtenemos la información

    try {
        fileResponse = apacheSitesParser(networkObjectId);
    } catch (e) {
        codeError = 500;
        return; //TODO: crear un log en el sistema de ficheros para los errores
    }

    //interpretamos la información obtenida

    for (let site in fileResponse) {

        const isValidPort = parseInt(fileResponse[site].port) === parseInt(requestedPort);
        const isValidIp = fileResponse[site].ip === "*" || fileResponse[site].ip === requestedIp;
        const isValidServerName = fileResponse[site].serverName === host || !fileResponse[site].serverName;

        if (isValidPort && isValidIp && isValidServerName) {

            const directoryIndex = fileResponse[site].directoryIndex;
            const documentRoot = fileResponse[site].documentRoot;
            const serverName = fileResponse[site].serverName;
            const indexesAllowed = fileResponse[site].indexesAllowed;

            //intentamos obtener el contenido solicitado o el contenido del index

            try {

                if (requestedResource !== "") {

                    const dividedResource = splitLast(requestedResource, "/");
                    let requestedFile;
                    let requestedDir;

                    if (dividedResource.length < 2) {
                        requestedFile = dividedResource[0];
                        requestedDir = [];
                    } else {
                        requestedFile = dividedResource[1];
                        requestedDir = dividedResource[0].split("/");
                    }

                    const newFullPath = [...documentRoot.split("/").slice(1), ...requestedDir];
                    apacheContent = networkObjectFileSystem.read(requestedFile, newFullPath);
                    codeError = 200;

                } else {

                    apacheContent = networkObjectFileSystem.read(directoryIndex, documentRoot.split("/").slice(1));
                    codeError = 200;

                }

            } catch (e) {

                if (requestedResource === "") {

                    const directoryIndexFiles = networkObjectFileSystem.ls("-R").split(" ").filter(el => el.startsWith(`${documentRoot}/`)).map(el => el.split(`${documentRoot}/`)[1]);

                    if (indexesAllowed === true) {
                        apacheContent = $DIRECTORYINDEXCONTENT(documentRoot, directoryIndexFiles);
                        codeError = 200;
                    } else {
                        apacheContent = $FORBIDDENCONTENT;
                        codeError = 403;
                    }

                } else {

                    apacheContent = $404ERRORCONTENT;
                    codeError = 404;

                }

            }

        }

    }

    newPacket.body = apacheContent;
    newPacket.statusCode = codeError;

    return newPacket;

}
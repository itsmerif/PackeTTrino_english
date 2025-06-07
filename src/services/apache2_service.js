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

    //definimos la solicitud

    const requestObject = {
        requestedPort: packet.dport,
        requestedIp: packet.destination_ip,
        requestedResource: packet.resource,
        requestedMethod: packet.method,
        requestedHost: packet.host
    }

    const [apacheContent, codeError] = obtainApacheContent(networkObjectId, requestObject);

    if (!apacheContent) apacheContent = $404ERRORCONTENT;
    newPacket.body = apacheContent;
    newPacket.statusCode = codeError;

    return newPacket;

}


function obtainApacheContent(networkObjectId, requestObject) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);

    //desglosamos la solicitud

    const requestedPort = requestObject.requestedPort;
    const requestedIp = requestObject.requestedIp;
    const requestedResource = (requestObject.requestedResource).endsWith("/") 
    ? (requestObject.requestedResource).slice(0, -1) 
    : requestObject.requestedResource;
    const requestedMethod = requestObject.requestedMethod;
    const host = requestObject.requestedHost;

    //parseamos el fichero de configuración de apache y obtenemos la información

    let fileResponse;

    try {
        fileResponse = apacheSitesParser(networkObjectId);
    } catch (e) {
        return [$404ERRORCONTENT, 500]; //TODO: crear un log en el sistema de ficheros para los errores
    }

    //interpretamos la información obtenida

    let apacheContent;

    for (let site in fileResponse) {

        const isValidPort = parseInt(fileResponse[site].port) === parseInt(requestedPort);
        const isValidIp = fileResponse[site].ip === "*" || fileResponse[site].ip === requestedIp;
        const isValidServerName = fileResponse[site].serverName === host || !fileResponse[site].serverName;

        if (!isValidPort || !isValidIp || !isValidServerName) continue;

        const directoryIndex = fileResponse[site].directoryIndex;
        const documentRoot = fileResponse[site].documentRoot;
        const serverName = fileResponse[site].serverName;
        const indexesAllowed = fileResponse[site].indexesAllowed;

        //intentamos obtener el contenido solicitado o el contenido del index

        try {

            //si no se ha especificado el recurso, se devuelve el index
            if (requestedResource === "") {

                if (networkObjectFileSystem.isFile(directoryIndex, documentRoot.split("/").slice(1))) {
                    apacheContent = networkObjectFileSystem.read(directoryIndex, documentRoot.split("/").slice(1));
                    return [apacheContent, 200];
                }

                //si no existe el archivo index, se devuelve el index del directorio
                if (indexesAllowed === true) {

                    const directoryIndexFiles = networkObjectFileSystem.ls("-R")
                    .split(" ")
                    .filter(el => el.startsWith(`${documentRoot}/`))
                    .map(el => el.split(`${documentRoot}/`)[1]);

                    apacheContent = $DIRECTORYINDEXCONTENT(documentRoot, directoryIndexFiles);
                    return [apacheContent, 200];

                }

                return [$FORBIDDENCONTENT, 403];

            }

            //se ha especificado el recurso, se devuelve el contenido
            const dividedResource = splitLast(requestedResource, "/");
            let requestedFile; //fichero que se solicita
            let requestedDir; //dir que se solicita

            if (dividedResource.length < 2) {
                requestedFile = dividedResource[0];
                requestedDir = [];
            } else {
                requestedFile = dividedResource[1];
                requestedDir = dividedResource[0].split("/");
            }

            const newFullPath = [...documentRoot.split("/").slice(1), ...requestedDir];

            //el recurso solicitado es un directorio
            if (networkObjectFileSystem.isDirectory(requestedFile, newFullPath)) {

                if (networkObjectFileSystem.isFile(directoryIndex, [...newFullPath, requestedFile])) {
                    apacheContent = networkObjectFileSystem.read(directoryIndex, [...newFullPath, requestedFile]);
                    return [apacheContent, 200];
                }

                //el index del directorio es permitido               
                if (indexesAllowed === true) {

                    const directoryIndexFiles = networkObjectFileSystem.ls("-R", newFullPath)
                    .split(" ")
                    .filter(el => el.startsWith(`${documentRoot}/${requestedFile}/`))
                    .map(el => el.split(`${documentRoot}/${requestedFile}/`)[1]);

                    apacheContent = $DIRECTORYINDEXCONTENT(`${newFullPath.join("/")}/${requestedFile}`, directoryIndexFiles);
                    return [apacheContent, 200];

                }

                return [$FORBIDDENCONTENT, 403];
            }

            //el recurso solicitado es un fichero
            if (networkObjectFileSystem.isFile(requestedFile, newFullPath)) {
                apacheContent = networkObjectFileSystem.read(requestedFile, newFullPath);
                return [apacheContent, 200];
            }

            //el recurso solicitado no existe
            return [$404ERRORCONTENT, 404];

        } catch (e) {

            return [$404ERRORCONTENT, 404];

        }


    }

    return [$404ERRORCONTENT, 404];

}
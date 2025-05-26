function apacheSitesParser(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    const sitesFiles = networkObjectFileSystem.ls("-R").split(" ").filter(el => el.startsWith("/etc/apache2/sites/")).map(el => el.split("/etc/apache2/sites/")[1]);

    const response = {};

    sitesFiles.forEach(siteFile => {

        const siteContent = networkObjectFileSystem.read(siteFile, ["etc", "apache2", "sites"]);
        const filteredSiteContent = siteContent.split("\n").map(line => line.trim()).filter(line => line !== "" && !line.startsWith("#")).join("\n");        
        const parser = new DOMParser();
        const $apacheDOM = parser.parseFromString(filteredSiteContent, "application/xml");

        if ($apacheDOM.querySelector("parsererror")) throw new Error("Error al analizar la configuración XML de Apache.");

        const $apacheVirtualHost = $apacheDOM.querySelector("VirtualHost");
        const ip = $apacheVirtualHost.getAttribute("ip");
        const port = $apacheVirtualHost.getAttribute("port");
        const $documentRoot = $apacheVirtualHost.querySelector("DocumentRoot");
        const $directoryIndex = $apacheVirtualHost.querySelector("DirectoryIndex");
        const directoryValue = $documentRoot?.getAttribute("value");
        const directoryIndexValue = $directoryIndex?.getAttribute("value");

        if (!ip) throw new Error("Error: No se ha especificado la dirección IP del servidor.");
        if (!port) throw new Error("Error: No se ha especificado el puerto del servidor.");
        if (!directoryValue) throw new Error("Error: No se ha especificado el directorio del servidor.");
        if (!directoryIndexValue) throw new Error("Error: No se ha especificado el index del servidor.");


        response[siteFile] = {
            ip: ip,
            port: port,
            documentRoot: directoryValue,
            directoryIndex: directoryIndexValue
        }

    });


    return response;

}

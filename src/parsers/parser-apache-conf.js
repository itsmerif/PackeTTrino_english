function apacheConfInterpreter(networkObjectId, content) {
    
    const $networkObject = document.getElementById(networkObjectId);
    const filteredContent = content.split("\n").map(line => line.trim()).filter(line => line !== "" && !line.startsWith("#")).join("\n"); //borramos comentarios y espacios en blanco
    const parser = new DOMParser();
    const $apacheDOM = parser.parseFromString(filteredContent, "application/xml");

    if ($apacheDOM.querySelector("parsererror")) throw new Error("Error al analizar la configuración XML de Apache.");

    const $apacheVirtualHosts = $apacheDOM.querySelectorAll("VirtualHost");

    $apacheVirtualHosts.forEach(virtualHost => {

        const ip = virtualHost.getAttribute("ip");
        const port = virtualHost.getAttribute("port");
        const $documentRoot = virtualHost.querySelector("DocumentRoot");
        const $directoryIndex = virtualHost.querySelector("DirectoryIndex");
        const directoryValue = $documentRoot?.getAttribute("value");
        const directoryIndexValue = $directoryIndex?.getAttribute("value");

        if (!ip) throw new Error("Error: No se ha especificado la dirección IP del servidor.");
        if (!port) throw new Error("Error: No se ha especificado el puerto del servidor.");
        if (!directoryValue) throw new Error("Error: No se ha especificado el directorio del servidor.");
        if (!directoryIndexValue) throw new Error("Error: No se ha especificado el index del servidor.");

        $networkObject.setAttribute("apacheIp", ip);
        $networkObject.setAttribute("apachePort", port);
        $networkObject.setAttribute("apacheDocumentRoot", directoryValue);
        $networkObject.setAttribute("apacheDirectoryIndex", directoryIndexValue);

    });


}

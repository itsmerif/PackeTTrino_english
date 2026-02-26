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

        if ($apacheDOM.querySelector("parsererror")) throw new Error("Error parsing Apache XML configuration.");

        const $apacheVirtualHost = $apacheDOM.querySelector("VirtualHost");
        const $documentRoot = $apacheVirtualHost.querySelector("DocumentRoot");
        const $directoryIndex = $apacheVirtualHost.querySelector("DirectoryIndex");
        const $options = $apacheVirtualHost.querySelector("Options");
        const $serverName = $apacheVirtualHost.querySelector("ServerName");

        const ip = $apacheVirtualHost.getAttribute("ip");
        const port = $apacheVirtualHost.getAttribute("port");
        const directoryValue = $documentRoot?.getAttribute("value");
        const directoryIndexValue = $directoryIndex?.getAttribute("value");
        const serverNameValue = $serverName?.getAttribute("value");
        const indexesAllowed = $options?.getAttribute("Indexes") === "true";
        const followSymLinks = $options?.getAttribute("FollowSymLinks") === "true";

        if (!ip) throw new Error("Error: The server IP address was not specified.");
        if (!port) throw new Error("Error: Server port not specified.");
        if (!directoryValue) throw new Error("Error: Server directory not specified.");
        if (!directoryIndexValue) throw new Error("Error: Server index not specified.");

        response[siteFile] = {
            ip: ip,
            port: port,
            documentRoot: directoryValue,
            directoryIndex: directoryIndexValue,
            serverName: serverNameValue,
            indexesAllowed: indexesAllowed,
            followSymLinks: followSymLinks
        }

    });


    return response;

}

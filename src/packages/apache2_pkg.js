function installApache2($networkObject) {

    terminalMessage("Installing Apache...", $networkObject.id);

    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    //atributos de apache

    attr("apache2", "true");
    
    //directorios y archivos

    const defaultApacheContent = $APACHEDEFAULTCONTENT.replace(/\s+/g, " ");

    const defaultApacheConf = $APACHECONFIGCONTENT.split("\n").map(line => line.trim()).filter(line => line !== "").join("\n");

    const networkObjectFileSystem = new FileSystem($networkObject);
    networkObjectFileSystem.mkdir("html", ["var", "www"]); 
    networkObjectFileSystem.mkdir("sites", ["etc", "apache2"]);
    networkObjectFileSystem.touch("index.html", ["var", "www", "html"]); 
    networkObjectFileSystem.write("index.html", ["var", "www", "html"], defaultApacheContent);
    networkObjectFileSystem.touch("000-default.conf", ["etc", "apache2", "sites"]);
    networkObjectFileSystem.write("000-default.conf", ["etc", "apache2", "sites"], defaultApacheConf);

    //se añaden eventos
    if ($networkObject.id.startsWith("pc-")) $networkObject.querySelector("img").src = "./assets/board/www-server.svg";

    terminalMessage("Apache successfully installed.", $networkObject.id);
    
}

function uninstallApache2(networkObjectId) {

    terminalMessage("Uninstalling Apache...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const networkObjectFileSystem = new FileSystem($networkObject);

    networkObjectFileSystem.rmdir("www", ["var"]);
    networkObjectFileSystem.rmdir("apache2", ["etc"]);

    rattr("apache2");
    
    if ($networkObject.id.startsWith("pc-")) $networkObject.querySelector("img").src = "./assets/board/pc.svg";

    terminalMessage("Apache successfully uninstalled.", networkObjectId);
}

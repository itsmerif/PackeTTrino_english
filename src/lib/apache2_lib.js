/**ESTA FUNCION DEVUELVE EL CONTENIDO DEL ARCHIVO INDEX.HTML DE UN DISPOSITIVO EN EL DIRECTORIO POR DEFECTO */
function getApacheWebContent(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectFileSystem = new FileSystem($networkObject);
    const htmlContent = networkObjectFileSystem.read("index.html", ["var", "www", "html"]);
    return htmlContent;
}
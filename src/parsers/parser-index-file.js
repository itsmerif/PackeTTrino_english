function loadApacheIndexContent(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const isApacheInstalled = $networkObject.getAttribute("apache") !== null;

    if (!isApacheInstalled) {
        terminalMessage("Error: El archivo /var/www/html/index.html no se puede editar porque el servidor web no está instalado.");
        return;
    }

    const fileEditorContainer = document.querySelector(".editor-container");
    let webContent = $networkObject.getAttribute("web-content");
    let content = fileEditorContainer.querySelector(".file-editor");
    content.value = webContent; 
    fileEditorContainer.style.display = "block";
    content.focus();
}


function savewebContent() {
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const fileEditor = document.querySelector(".file-editor");
    const fileContent = fileEditor.value;
    $networkObject.setAttribute("web-content", fileContent);
    terminalMessage("El contenido se ha guardado correctamente.");
}
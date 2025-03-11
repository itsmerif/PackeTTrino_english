function loadApacheIndexContent(networkObjectId) {
    if (!networkObjectId.startsWith("pc-")) {
        terminalMessage("Error: Comando solo puede ser ejecutado desde un equipo host.");
        return;
    }
    const fileEditorContainer = document.querySelector(".editor-container");
    const $networkObject = document.getElementById(networkObjectId); //recuperamos el objeto
    let webContent = $networkObject.getAttribute("web-content"); //obtenemos el contenido web
    let content = fileEditorContainer.querySelector(".file-editor");
    content.value = webContent; 
    fileEditorContainer.style.display = "block"; //mostramos el editor
}


function savewebContent() {
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const fileEditor = document.querySelector(".file-editor");
    const fileContent = fileEditor.value;
    $networkObject.setAttribute("web-content", fileContent);
    terminalMessage("El contenido se ha guardado correctamente.");
}
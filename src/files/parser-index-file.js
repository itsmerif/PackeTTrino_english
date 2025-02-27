function loadApacheIndexContent(networkObjectId) {
    if (!networkObjectId.startsWith("pc-")) {
        terminalMessage("Error: Comando solo puede ser ejecutado desde un equipo host.");
        return;
    }
    const fileEditorContainer = document.querySelector(".editor-container");
    const $networkObject = document.getElementById(networkObjectId); //recuperamos el objeto
    let webContent = $networkObject.getAttribute("web-content"); //obtenemos el contenido web
    let content = fileEditorContainer.querySelector(".file-editor");

    //formateamos el contenido
    webContent = webContent.replace(/>/g, ">\n"); //p se convierte en salto de linea
    content.value = webContent; //cargamos el contenido
    fileEditorContainer.style.display = "block"; //mostramos el editor
}


function savewebContent() {
    const $networkObject = document.getElementById(document.querySelector(".pc-terminal").dataset.id);
    const fileEditor = document.querySelector(".file-editor");
    const fileContent = fileEditor.value;
    const lines = fileContent.split("\n"); //cada linea del archivo
    const filteredLines = lines.map(line => line.trim().replace(/\s+/g, " ")).filter(line => line !== ""); //cada linea filtrada
    const minifiedContent = filteredLines.join(""); //contenido minificado
    $networkObject.setAttribute("web-content", minifiedContent);
    terminalMessage("El contenido se ha guardado correctamente.");
}

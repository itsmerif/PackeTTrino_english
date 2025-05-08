function command_nano(networkObjectId, file) {

    const $networkObject = document.getElementById(networkObjectId);
    const frameTitle = document.querySelector(".editor-frame").querySelector("span");
    const fileEditorContainer = document.querySelector(".editor-wrapper");
    const editorArea = fileEditorContainer.querySelector(".file-editor");
    let fileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder(file);
    let fileName = directoryPath.pop();

    try {
        let fileContent = fileSystem.open(fileName, directoryPath); //<-- intentamos abrir el archivo
        frameTitle.innerHTML = file; //<-- establecemos el título del editor visualmente
        editorArea.setAttribute("data-file", file); //<-- establecemos el nombre del archivo en el editor
        editorArea.value = fileContent; //<-- volcamos el contenido del archivo
        fileEditorContainer.style.display = "block"; //<-- mostramos el editor
        editorArea.focus();
    } catch (e) {
        terminalMessage(e.message, networkObjectId);
        console.log(e);
    }

}
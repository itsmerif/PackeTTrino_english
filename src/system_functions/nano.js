function command_nano(dataId, args) {

    const fileName = args[1];

    if (!fileName) {
        terminalMessage("Error: El nombre del archivo no puede estar vacío");
        return;
    }

    const networkObjectId = document.querySelector(".terminal-component").dataset.id;
    const fileEditor = document.querySelector(".file-editor");
    const frameTitle = document.querySelector(".editor-frame").querySelector("span");
    document.querySelector(".editor-buttons").addEventListener("mousedown", event => {
        event.stopPropagation();
    });


    if (fileName === "/etc/network/interfaces") {
        fileEditor.setAttribute("data-file", "/etc/network/interfaces");
        frameTitle.innerHTML = "/etc/network/interfaces";
        loadNetworkFile(networkObjectId);
        return;
    }

    if (fileName === "/etc/resolv.conf") {
        fileEditor.setAttribute("data-file", "/etc/resolv.conf");
        frameTitle.innerHTML = "/etc/resolv.conf";
        loadResolvConf(networkObjectId);
        return;
    }

    if (fileName === "/var/www/html/index.html" || fileName === "-n") {
        fileEditor.setAttribute("data-file", "/var/www/html/index.html");
        frameTitle.innerHTML = "/var/www/html/index.html";
        loadApacheIndexContent(networkObjectId);
        return;
    }

    if (fileName === "/etc/hosts") {

        fileEditor.setAttribute("data-file", "/etc/hosts");
        frameTitle.innerHTML = "/etc/hosts";

        if (networkObjectId.startsWith("pc-")) {
            loadEtcHostsContent(networkObjectId);
        } else {
            terminalMessage("Error: No se puede editar el archivo /etc/hosts en el equipo " + networkObjectId);
        }

        return;

    }

    terminalMessage("Error: El archivo no existe.");
}


function fileEditorKeyboard(event) {

    event.stopPropagation();
    
    const textarea = event.target;

    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        closeEditor();
        document.querySelector(".terminal-component").querySelector("input").focus();
    }

    if (event.key === "Tab") {
        event.preventDefault();
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    }

}

function closeEditor() {

    const fileEditor = document.querySelector(".file-editor");
    const fileName = fileEditor.getAttribute("data-file");
    const networkObjectId = document.querySelector(".terminal-component").dataset.id;

    if (fileName === "/etc/network/interfaces") {

        if (networkObjectId.startsWith("router-")) {
            routingTableRestore(document.querySelector(".terminal-component").dataset.id);
        }

        try {

            parserNetworkFile();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }

        return;

    }

    if (fileName === "/etc/resolv.conf") {

        try {

            parserResolvConf();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }
    }

    if (fileName === "/var/www/html/index.html") {
        savewebContent();
        document.querySelector(".editor-container").style.display = "none";
        document.querySelector(".file-editor").value = "";
    }

    if (fileName === "/etc/hosts") {

        try {

            parserEtcHosts();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";
            terminalMessage("El archivo se ha cargado correctamente.");

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }

    }
}
function loadResolvConf(networkObjectId) {

    if (networkObjectId.startsWith("router-")) {
        terminalMessage("Error: El archivo /etc/resolv.conf no se puede editar en un router.");
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const serverDns = $networkObject.getAttribute("data-dns-server");
    const fileEditorContainer = document.querySelector(".editor-container");
    let content = fileEditorContainer.querySelector(".file-editor");

    let fileContent;
    fileContent = `#Here you can add your own nameservers to the DNS resolver\n`;
    fileContent += `\n`;
    if (serverDns !== "") {
        fileContent += `nameserver ${serverDns}\n`;
    }
    content.value = fileContent;
    fileEditorContainer.style.display = "block";

}


function parserResolvConf() {

    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".pc-terminal").dataset.id);
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");
    const lines = unfilteredlines.map(line => line.trim().replace(/\s+/g, " ")).filter(line => line !== ""); //eliminamos los espacios duplicados y las lineas vacias

    const ipServer = lines[1].split(" ")[1];

    if (!isValidIp(ipServer)) {
        throw new Error(`Error en la línea 1: IP no válida.`);
    }

    $networkObject.setAttribute("data-dns-server", ipServer);
    terminalMessage("El archivo se ha cargado correctamente.");
    return;

}
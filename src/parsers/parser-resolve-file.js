function loadResolvConf(networkObjectId) {

    if (networkObjectId.startsWith("router-")) {
        terminalMessage("Error: El archivo /etc/resolv.conf no se puede editar en un router.", networkObjectId);
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const serverDns = $networkObject.getAttribute("data-dns-server");
    const fileEditorContainer = document.querySelector(".editor-container");
    let content = fileEditorContainer.querySelector(".file-editor");
    content.setAttribute("data-file", "/etc/resolv.conf");

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
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const fileEditor = document.querySelector(".file-editor");
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");
    const lines = unfilteredlines.map(line => line.trim().replace(/\s+/g, " ")).filter(line => line !== "");

    for (let i = 0; i < lines.length; i++) {

        if (lines[i].startsWith("nameserver")) {

            let ip = lines[i].split(" ")[1];

            if (!isValidIp(ip)) {
                throw new Error(`Error en la línea ${i + 1}: IP no válida.`);
            }

            $networkObject.setAttribute("data-dns-server", ip);
            return;
            
        }
    }
}
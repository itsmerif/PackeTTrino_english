function command_nano(networkObjectId, args) {

    const fileName = args[1];
    const fileEditor = document.querySelector(".file-editor");
    const frameTitle = document.querySelector(".editor-frame").querySelector("span");

    const fileActions = {
        "/etc/network/interfaces": () => loadNetworkFile(networkObjectId),
        "/etc/resolv.conf": () => loadResolvConf(networkObjectId),
        "/var/www/html/index.html": () => loadApacheIndexContent(networkObjectId),
        "/etc/hosts": () => loadEtcHostsContent(networkObjectId),
    }

    if (fileActions[fileName]) {

        fileEditor.setAttribute("data-file", fileName);
        frameTitle.innerHTML = fileName;
        document.querySelector(".editor-buttons").addEventListener("mousedown", event => { event.stopPropagation();});
        fileActions[fileName]();
        return;
    }

    terminalMessage(`Error: No se reconoce el archivo ${fileName}.`, networkObjectId);

}
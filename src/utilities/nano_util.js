function command_nano(dataId, args) {

    const fileName = args[1];
    const fileEditor = document.querySelector(".file-editor");
    const frameTitle = document.querySelector(".editor-frame").querySelector("span");

    const fileActions = {
        "/etc/network/interfaces": () => loadNetworkFile(dataId),
        "/etc/resolv.conf": () => loadResolvConf(dataId),
        "/var/www/html/index.html": () => loadApacheIndexContent(dataId),
        "/etc/hosts": () => loadEtcHostsContent(dataId),
    }

    if (fileActions[fileName]) {

        fileEditor.setAttribute("data-file", fileName);
        frameTitle.innerHTML = fileName;
        document.querySelector(".editor-buttons").addEventListener("mousedown", event => { event.stopPropagation();});
        fileActions[fileName]();
        return;
    }

    terminalMessage(`Error: No se reconoce el archivo ${fileName}.`);

}
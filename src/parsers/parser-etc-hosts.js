function loadEtcHostsContent(networkObjectId) {
    const fileEditorContainer = document.querySelector(".editor-wrapper"); //obtenemos el contenedor del editor
    const $networkObject = document.getElementById(networkObjectId); //recuperamos el objeto
    let etcHostFile = $networkObject.getAttribute("data-etc-hosts"); //obtenemos el contenido etc-hosts
    let etcHostsEntries = JSON.parse(etcHostFile); //convertimos el contenido a un objeto
    if (!etcHostsEntries) etcHostsEntries = {}; //si no hay entradas, creamos un objeto vacío

    //creamos el contenido del archivo iterando sobre el objeto

    let fileContent = "";
    for (let ip in etcHostsEntries) {
        fileContent += `${ip} ${etcHostsEntries[ip].join(" ")}\n`;
    }

    //actualizamos el contenido del editor

    let content = fileEditorContainer.querySelector(".file-editor");
    content.value = fileContent;
    fileEditorContainer.style.display = "block";

}

function parserEtcHosts() {
    const fileEditor = document.querySelector(".file-editor");
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const fileContent = fileEditor.value;
    const unfilteredlines = fileContent.split("\n");
    const lines = unfilteredlines
    .map(line => line.trim().replace(/\s+/g, " "))
    .filter(line => line !== "");
    let etcHostsEntries = {};
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let ip = line.split(" ")[0];
        if (!isValidIp(ip)) throw new Error(`Error en la línea ${i}: IP no válida.`);
        let names = line.split(" ").slice(1);
        etcHostsEntries[ip] = names;
    }
    $networkObject.setAttribute("data-etc-hosts", JSON.stringify(etcHostsEntries));
}
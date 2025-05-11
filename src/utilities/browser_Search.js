async function browserSearch() {

    const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
    const $browser = document.querySelector(".browser-component");
    const $addressInput = $browser.querySelector(".address-input");

    const search = $addressInput.value.trim(); //<-- obtenemos la entrada de direccion

    if (visualToggle) await minimizeBrowser();

    try {

        await http($networkObject.id, search);

    } catch (error) {

        document.querySelector(".browser-content").srcdoc = $error404;

    }

    if (visualToggle) await maximizeBrowser();


}

async function http(networkObjectId, arg) {

    delete browserBuffer[networkObjectId];
    let destinationIp = arg;

    if (!isValidIp(destinationIp)) {
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) throw new Error("Error: No se pudo resolver el dominio.");
    }

    const source_port = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152; // <--- puerto efímero aleatorio para el origen

    await tcpSynPacketGenerator(networkObjectId, destinationIp, source_port, 80);

    if (tcpSyncFlag[networkObjectId] === false) throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");

    await httpRequestPacketGenerator(networkObjectId, destinationIp, source_port, 80);

    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) throw new Error("Error: No se ha recibido respuesta del servidor web.");

    terminalMessage("Conexión establecida con el servidor web.", networkObjectId);

    let content = htmlReply.body;
    const $browserContent = document.querySelector(".browser-content");
    $browserContent.srcdoc = content;

}
async function browserSearch(event) {

    if (event.key === 'Enter') {

        const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
        const search = event.target.value.trim();

        if (visualToggle) await minimizeBrowser();

        try {
            await http($networkObject.id, search);
        } catch (error) {
            console.log(error);
            document.querySelector(".browser-content").srcdoc = $error404;
        }

        if (visualToggle) await maximizeBrowser();

    }
}

async function http(networkObjectId, arg) {

    const $networkObject = document.getElementById(networkObjectId);
    const switchId = $networkObject.getAttribute("data-switch-enp0s3");
    delete browserBuffer[networkObjectId];
    let destinationIp = arg;

    if (!isValidIp(destinationIp)) {
        destinationIp = await domainNameResolution(networkObjectId, destinationIp);
        if (!destinationIp) throw new Error("Error: No se pudo resolver el dominio.");
    }

    await tcp(networkObjectId, destinationIp, 80);
    if (tcpSyncFlag === false) throw new Error(networkObjectId + ": No se pudo establecer la conexión TCP.");

    await httpRequestPacketGenerator(networkObjectId, switchId, destinationIp);
    let htmlReply = browserBuffer[networkObjectId];

    if (!htmlReply) throw new Error("Error: No se ha recibido respuesta del servidor web.");

    terminalMessage("Conexión establecida con el servidor web.", networkObjectId);

    let content = htmlReply.body;
    const $browserContent = document.querySelector(".browser-content");
    $browserContent.srcdoc = content;

}
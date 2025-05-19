async function browserSearch() {

    const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
    const $browser = document.querySelector(".browser-component");
    const $browserContent = $browser.querySelector(".browser-content");
    const $addressInput =  $browser.querySelector(".address-input");

    if (visualToggle) await minimizeBrowser();

    try {

        const [protocol, address, port] = parseSearch($addressInput.value.trim());

        $browser.querySelector(".address-input").value = `http://${address}${(port === 80) ? "" : `:${port}`}`; //<-- actualizamos la entrada

        const webContent = await http($networkObject.id, address, "GET", port);

        $browserContent.srcdoc = webContent;

    } catch (error) {

        $browserContent.srcdoc = $error404;
        
    }

    if (visualToggle) await maximizeBrowser();

}

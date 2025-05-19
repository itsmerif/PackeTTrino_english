async function browserSearch() {

    const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
    const $browser = document.querySelector(".browser-component");
    const $addressInput = $browser.querySelector(".address-input");
    const search = $addressInput.value.trim(); //<-- obtenemos la entrada de direccion

    if (visualToggle) await minimizeBrowser();

    try {

        const webContent = await http($networkObject.id, search);
        $browser.querySelector(".browser-content").srcdoc = webContent;

    } catch (error) {

        $browser.querySelector(".browser-content").srcdoc = $error404 + "<br><br>" + error.message;       
    }

    if (visualToggle) await maximizeBrowser();


}

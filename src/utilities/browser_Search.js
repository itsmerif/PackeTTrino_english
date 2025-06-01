async function browserSearch() {

    const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
    const $browser = document.querySelector(".browser-component");
    const $browserContent = $browser.querySelector(".browser-content");
    const $addressInput = $browser.querySelector(".address-input");

    if (visualToggle) await minimizeBrowser();

    try {

        const search = parseSearch($addressInput.value.trim());

        //cambiamos la url del navegador

        $browser.querySelector(".address-input").value = [
            `http://${search.address}`,
            (search.port === 80 ? "" : `:${search.port}`),
            `/${search.resource}`
        ].join('');

        const httpReply = await http($networkObject.id, {
            address: search.address,
            method: "GET",
            dport: search.port,
            resource: search.resource
        });

        $browserContent.srcdoc = httpReply.body;

    } catch (error) {

        $browserContent.srcdoc = $BROWSERERRORPAGE;

    }

    if (visualToggle) await maximizeBrowser();

}

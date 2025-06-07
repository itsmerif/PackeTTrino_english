async function browserSearch() {

    const $networkObject = document.getElementById(document.querySelector(".browser-component").getAttribute("data-id"));
    const $browser = document.querySelector(".browser-component");
    const $browserContent = $browser.querySelector(".browser-content");
    const $addressInput = $browser.querySelector(".address-input");

    if (visualToggle) await minimizeBrowser();

        try {

            //variables y mapas

            const search = parseSearch($addressInput.value.trim());

            const portsToHide = [80, 443];
            
            const requestFunctions = {
                "http": async () => {
                    return http($networkObject.id, {
                        address: search.address,
                        method: "GET",
                        dport: search.port,
                        resource: search.resource
                    });
                },

                "ptt": async () => {
                    return http($networkObject.id, {
                        address: search.address,
                        method: "GET",
                        dport: search.port,
                        resource: search.resource
                    });
                },
            };

            const replyFunctions = {
                "http": (httpReply) => $browserContent.srcdoc = httpReply.body,
                "https": (httpReply) => $browserContent.srcdoc = httpReply.body,
                "ptt": (httpReply) => {
                    $browserContent.removeAttribute("srcdoc");
                    $browserContent.src = httpReply.body;
                }
            }

            //actualizamos la barra de direcciones

            $browser.querySelector(".address-input").value = [
                `${search.protocol}://${search.address}`,
                (portsToHide.includes(search.port)) ? "" : `:${search.port}`,
                `/${search.resource}`
            ].join('');

            //realizamos la solicitud

            const httpReply = await requestFunctions[search.protocol]();
            replyFunctions[search.protocol](httpReply);

        } catch (error) {

            $browserContent.srcdoc = $BROWSERERRORPAGE;

        }

    if (visualToggle) await maximizeBrowser();

}

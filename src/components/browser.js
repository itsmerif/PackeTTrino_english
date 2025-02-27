function dragBroswer(event) {

    event.preventDefault();
    const browser = event.target.closest(".pc-browser");
    let rect = browser.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;

    browser.style.left = `${rect.left}px`;
    browser.style.top = `${rect.top}px`;
    browser.style.transform = 'none';
    browser.style.position = 'fixed';

    function moveBrowser(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - browser.offsetWidth;
        let maxY = window.innerHeight - browser.offsetHeight;
        browser.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        browser.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    }

    function stopDraggingBrowser() {
        document.removeEventListener('mousemove', moveBrowser);
        document.removeEventListener('mouseup', stopDraggingBrowser);
        const input = browser.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveBrowser);
    document.addEventListener('mouseup', stopDraggingBrowser);

}

function browserSearch(event) {

    if (event.key === 'Enter') {

        const $searchInput = event.target;
        const $browserContent = document.querySelector(".browser-content");
        let search = $searchInput.value.trim();

        if (search === "localhost") {
            fetch(`./assets/browser/localhost.html`)
                .then(response => response.text())
                .then(html => {
                    $browserContent.innerHTML = html;
                })
                .catch(error => console.log(error));

            return;
        }

        if (search === "amin.com") {
            let $networkObject = document.getElementById(document.querySelector(".pc-browser").getAttribute("data-id"));
            let webContent = $networkObject.getAttribute("web-content");
            $browserContent.innerHTML = webContent;
            return;
        }

        $browserContent.innerHTML = `
            <div class="container">
                <div class="error-code">404</div>
                <h1>¡Página no encontrada!</h1>
                <p>La página que estás buscando no existe o ha sido movida a otra ubicación.</p>
                <a href="/" class="btn">Volver al inicio</a>
            </div>`;
    }
}

function openBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = event.target.closest(".item-dropped"); //obtengo el objeto mas cercano
    $networkObject.querySelector(".advanced-options-modal").style.display = "none"; //ocultamos el modal de opciones avanzadas
    document.querySelector(".pc-browser").style.display = "flex"; //mostramos el navegador
    document.querySelector(".pc-browser").setAttribute("data-id", $networkObject.id); //establecemos el id del navegador
}

function closeBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log("cerrando");
    document.querySelector(".browser-content").innerHTML = `<img src="./assets/browser/aminsearch.png" alt="logo"></img>`; //recuperamos el contenido original del navegador
    document.querySelector(".address-input").value = ""; //limpiamos la entrada de direccion
    document.querySelector(".pc-browser").style.display = "none"; //ocultamos el navegador
}
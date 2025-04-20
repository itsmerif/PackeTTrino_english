function browser() {

    const $browser = document.createElement("div");
    $browser.classList.add("browser-component", "draggable-modal");
    $browser.setAttribute("data-id", "");
    
    $browser.innerHTML = `
        <div class="browser-header">

        <div class="browser-controls">
            <button class="control close" aria-label="Cerrar"></button>
            <button class="control minimize" aria-label="Minimizar"></button>
            <button class="control maximize" aria-label="Maximizar"></button>
        </div>

        <div class="browser-tabs">
            <button class="tab active">Nueva pestaña</button>
        </div>

        <div class="browser-address-bar">

            <div class="address-bar-icons">
            <button class="icon back" aria-label="Atrás">◀</button>
            <button class="icon forward" aria-label="Adelante">▶</button>
            <button class="icon refresh" aria-label="Actualizar">↻</button>
            </div>

            <input type="text" class="address-input" placeholder="https://www.ejemplo.com"
            aria-label="Barra de direcciones">

            <div class="address-bar-icons">
            <button class="icon star" aria-label="Marcar como favorito">★</button>
            <button class="icon menu" aria-label="Menú">⋮</button>
            </div>

        </div>

        </div>

        <iframe class="browser-content"></iframe>
    `;
    
    $browser.addEventListener("mousedown", dragModal);
    $browser.querySelector(".control.close").addEventListener("click", closeBrowser);
    $browser.querySelector(".control.minimize").addEventListener("click", minimizeBrowser);
    $browser.querySelector(".control.maximize").addEventListener("click", maximizeBrowser);
    $browser.querySelector(".address-input").addEventListener("keydown", browserSearch);
    $browser.querySelector(".address-input").addEventListener("mousedown", event => { event.stopPropagation(); });
    $browser.querySelector(".browser-content").addEventListener("mousedown", event => { event.stopPropagation(); });

    return $browser;

}

//constantes de navegador

const $homepage = `
<html>
    <head>
        <title>Amin Search</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <style>
        body {
            margin: 0;
            display: grid;
            place-items: center;
            height: 70vh;
        }
    </style>
    <body>
        <img src="./assets/browser/aminsearch.png" alt="logo">
    </body>
</html>`;

const $error404 = `
<html>
    <head>
        <title>Amin Search</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <style>
        body {
            margin: 0;
            display: grid;
            place-items: center;
            height: 70vh;
        }
    </style>
    <body>
        <div class="container">
            <div class="error-code">404</div>
            <h1>¡Página no encontrada!</h1>
            <p>La página que estás buscando no existe o ha sido movida a otra ubicación.</p>
        </div>
    </body>
</html>`;

const $forbidden403 = `
<!DOCTYPE html>
<html style="height:100%">
    <head>
    <title> 403 Forbidden
    </title><style>@media (prefers-color-scheme:dark){body{background-color:#000!important}}</style></head>
    <body style="color: #444; margin:0;font: normal 14px/20px Arial, Helvetica, sans-serif; height:100%; background-color: #fff;">
        <div style="height:auto; min-height:100%; ">     <div style="text-align: center; width:800px; margin-left: -400px; position:absolute; top: 30%; left:50%;">
                <h1 style="margin:0; font-size:150px; line-height:150px; font-weight:bold;">403</h1>
        <h2 style="margin-top:20px;font-size: 30px;">Forbidden
        </h2>
        <p>Access to this resource on the server is denied!</p>
        </div></div>
    </body>
</html>`;

function openBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = event.target.closest(".item-dropped"); //obtengo el objeto mas cercano
    $networkObject.querySelector(".advanced-options-modal").style.display = "none"; //ocultamos el modal de opciones avanzadas
    document.querySelector(".browser-content").srcdoc = $homepage //recuperamos el contenido original del navegador
    document.querySelector(".browser-component").style.display = "flex"; //mostramos el navegador
    document.querySelector(".browser-component").setAttribute("data-id", $networkObject.id); //establecemos el id del navegador
}

function closeBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const browser = document.querySelector(".browser-component");
    if (browser.style.left !== "0px" && browser.style.left !== "0%") {
        document.querySelector(".browser-content").innerHTML = `<img src="./assets/browser/aminsearch.png" alt="logo"></img>`; //recuperamos el contenido original del navegador
        document.querySelector(".address-input").value = ""; //limpiamos la entrada de direccion
        document.querySelector(".browser-component").style.display = "none"; //ocultamos el navegador
    }
}

async function minimizeBrowser() {
    const browser = document.querySelector(".browser-component");
    if (!browser || browser.style.display === "none") return resolve();
    if (browser.style.left === "0px" || browser.style.left === "0%") return resolve();
    return new Promise(resolve => {
        const rect = browser.getBoundingClientRect();
        const targetWidth = rect.width * 0.3;
        const targetHeight = rect.height * 0.3;
        const windowHeight = window.innerHeight;
        browser.style.transition = "all 0.5s ease-in-out";
        browser.style.width = `${targetWidth}px`;
        browser.style.height = `${targetHeight}px`;
        browser.style.top = `${windowHeight - targetHeight}px`;
        browser.style.left = "0%";
        browser.style.transform = "translate(0%, 0)";
        browser.addEventListener("transitionend", resolve, { once: true }); 
    });
}

async function maximizeBrowser() {
    return new Promise(resolve => {
        const browser = document.querySelector(".browser-component");
        if (!browser || browser.style.display === "none") return;
        browser.style.transition = "all 0.5s ease-in-out";
        browser.style.width = "60dvw";
        browser.style.height = "700px";
        browser.style.top = "40%";
        browser.style.left = "50%";
        browser.style.transform = "translate(-50%, -50%)";
        browser.addEventListener("transitionend", () => {
            browser.style.transition = "none";
            resolve();
        }, { once: true });
    });
}
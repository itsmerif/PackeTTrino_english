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

const forbidden403 = `
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

//funciones de navegador

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

async function browserSearch(event) {
    if (event.key === 'Enter') {
        const $searchInput = event.target;
        const $networkObject = document.getElementById(document.querySelector(".pc-browser").getAttribute("data-id"));
        let search = $searchInput.value.trim();
        try {
            await http($networkObject.id, search);
        } catch (error) {
            document.querySelector(".browser-content").srcdoc = $error404;
        }
    }
}

function openBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = event.target.closest(".item-dropped"); //obtengo el objeto mas cercano
    $networkObject.querySelector(".advanced-options-modal").style.display = "none"; //ocultamos el modal de opciones avanzadas
    document.querySelector(".browser-content").srcdoc = $homepage //recuperamos el contenido original del navegador
    document.querySelector(".pc-browser").style.display = "flex"; //mostramos el navegador
    document.querySelector(".pc-browser").setAttribute("data-id", $networkObject.id); //establecemos el id del navegador
}

function closeBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const browser = document.querySelector(".pc-browser");
    if (browser.style.left !== "0px" && browser.style.left !== "0%") {
        document.querySelector(".browser-content").innerHTML = `<img src="./assets/browser/aminsearch.png" alt="logo"></img>`; //recuperamos el contenido original del navegador
        document.querySelector(".address-input").value = ""; //limpiamos la entrada de direccion
        document.querySelector(".pc-browser").style.display = "none"; //ocultamos el navegador
    }
}

async function minimizeBrowser() {
    const browser = document.querySelector(".pc-browser");
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
        const browser = document.querySelector(".pc-browser");
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
function browser() {

    const $browser = document.createElement("div");
    $browser.classList.add("browser-component", "draggable-modal");
    $browser.setAttribute("data-id", "");
    
    $browser.innerHTML = `

        <div class="browser-header">

            <div class="browser-controls">
                <button class="control close" aria-label="Close"></button>
                <button class="control minimize" aria-label="Minimize"></button>
                <button class="control maximize" aria-label="Maximize"></button>
            </div>

            <div class="browser-tabs">
                <button class="tab active">New tab</button>
            </div>

            <div class="browser-address-bar">

                <div class="address-bar-icons">
                   <!-- <button class="icon back" aria-label="Back">◀</button>
                    <button class="icon forward" aria-label="Forward">▶</button> -->
                    <button class="icon refresh" aria-label="Refresh" id="btn-refresh">↻</button>
                </div>

                <input type="text" class="address-input" placeholder="https://www.ejemplo.com" aria-label="Address bar">

               <!-- <div class="address-bar-icons">
                    <button class="icon star" aria-label="Mark as favorite">★</button>
                    <button class="icon menu" aria-label="Menu">⋮</button>
                </div> -->

            </div>

        </div>

        <iframe class="browser-content"></iframe>
    `;
    
    $browser.querySelector(".browser-tabs").addEventListener("mousedown", dragModal);
    $browser.querySelector(".control.close").addEventListener("click", closeBrowser);
    $browser.querySelector(".control.minimize").addEventListener("click", minimizeBrowser);
    $browser.querySelector(".control.maximize").addEventListener("click", maximizeBrowser);
    $browser.querySelector(".address-input").addEventListener("keydown", event => {
        if (event.key === 'Enter') browserSearch();
    });
    $browser.querySelector(".address-input").addEventListener("mousedown", event => { event.stopPropagation(); });
    $browser.querySelector(".browser-content").addEventListener("mousedown", event => { event.stopPropagation(); });
    $browser.querySelector("#btn-refresh").addEventListener("click", browserSearch);

    return $browser;

}

//browser constants

const $BROWSERHOMEPAGE = `
    <title>Amin Search</title><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport>
    <style>body{margin:0;display:grid;place-items:center;height:70vh}</style><img alt=logo src=./assets/browser/aminsearch.png>
`;

const $BROWSERERRORPAGE = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <title>Amin™ Search</title>
        <meta charset="UTF-8">
        <meta content="width=device-width,initial-scale=1" name="viewport">
        <style>
            :root {
                --primary-color: #2563eb;
                --accent-color: #ea580c;
                --text-color: #1e293b;
                --light-bg: #f8fafc;
                --dark-bg: #0f172a;
                --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                color: var(--text-color);
                background-color: var(--light-bg);
                height: 100vh;
                display: grid;
                place-items: center;
                padding: 0 20px;
            }

            .container {
                max-width: 900px;
                width: 100%;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                text-align: center;
                padding-bottom: 30px;
            }

            .error-header {
                background-color: var(--dark-bg);
                color: white;
                padding: 24px;
                margin-bottom: 20px;
            }

            .error-code {
                font-size: 96px;
                font-weight: 700;
                color: var(--primary-color);
                line-height: 1;
                margin: 20px 0;
            }

            h1 {
                color: var(--accent-color);
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 16px;
            }

            p {
                margin: 0 auto;
                max-width: 500px;
                font-size: 16px;
                padding: 0 20px;
            }

            @media (max-width: 768px) {
                .container {
                    margin: 20px auto;
                }
                
                .error-code {
                    font-size: 72px;
                }
                
                h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-header">
                <span>Amin Search</span>
            </div>
            <div class="error-code">404</div>
            <h1>¡Página no encontrada!</h1>
            <p>La página que estás buscando no existe o ha sido movida a otra ubicación.</p>
            <p id="error-message"></p>
        </div>
    </body>
    </html>
`;

function openBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const $networkObject = event.target.closest(".item-dropped"); //obtengo el objeto mas cercano
    $networkObject.querySelector(".advanced-options-modal").style.display = "none"; //ocultamos el modal de opciones avanzadas
    document.querySelector(".browser-content").srcdoc = $BROWSERHOMEPAGE //recuperamos el contenido original del navegador
    document.querySelector(".browser-component").style.display = "flex"; //mostramos el navegador
    document.querySelector(".browser-component").setAttribute("data-id", $networkObject.id); //establecemos el id del navegador
}

function closeBrowser(event) {
    event.stopPropagation();
    event.preventDefault();
    const browser = document.querySelector(".browser-component");
    if (browser.style.left !== "0px" && browser.style.left !== "0%") {
        
//we retrieve the original browser content
        document.querySelector(".browser-content").innerHTML = `<img src="./assets/browser/aminsearch.png" alt="logo"></img>`;
        
//we clear the address input
        document.querySelector(".address-input").value = "";
        //we remove the reference to src
        document.querySelector(".browser-content").removeAttribute("src");
        //we hide the browser
        document.querySelector(".browser-component").style.display = "none";
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

class slide { 
    constructor(title, media, text ) {
        this.title = title || "";
        this.media = media || "";
        this.content = text || "";
        this.mediaHeight = "200px";
        this.mediaBackgroundColor = "transparent";
        this.mediaShadow = "0 15px 35px rgba(0, 0, 0, 0.2)";
    }
}

class slidePresentation {

    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.isRendered = false;
    }

    addSlide(...slides) {
        this.slides.push(...slides);
    }

    startPresentation() {

        const $slidePresentationHTML = document.createElement('div');
        
        $slidePresentationHTML.classList.add('slide-presentation');

        $slidePresentationHTML.innerHTML = `
            ${
                this.slides.map((slide, index) => {
                    
                    const slideStyle = `
                        height: ${slide.mediaHeight};
                        background-color: ${slide.mediaBackgroundColor};
                        box-shadow: ${slide.mediaShadow};
                    `;

                    return `<div class="slide" id="slide-${index}">
                        <h1 class="slide__title">${slide.title}</h1>
                        <div class="main-content">
                            <img class="slide__media" src="${slide.media}" style="${slideStyle}" alt="media">
                            <p class="slide__content">${slide.content}</p>
                        </div>
                    </div>`;

                }).join('')
            }

            <div class="page-selector">
                ${
                    this.slides.map((slide, index) => {
                        return `<button class="page-selector__btn" onclick="tutorial.render(${index});">${index + 1}</button>`;
                    }).join('')
                }
                <img class="next-slide-btn" src="./assets/tutorial/next.svg" alt="next" onclick="tutorial.render(tutorial.currentSlide + 1);">
                <button class="end-presentation btn-modern-blue" onclick="tutorial.endPresentation();">Listo!</button>
            </div>
            <div class="links">
                <a href="https://github.com/EvilPrime98/PackeTTrino" target="_blank">
                    <img src="./assets/github.svg" alt="github">
                </a>
                <a href="https://www.linkedin.com/in/josé-amín-pérez-alconchel-2191b430b" target="_blank">
                    <img src="./assets/linkedin.svg" alt="linkedin">
                </a>
            </div>
        `;

        $slidePresentationHTML.querySelectorAll('.slide').forEach( $slide => $slide.classList.add('hidden') );
        $slidePresentationHTML.querySelectorAll('.slide')[0].classList.remove('hidden');
        $slidePresentationHTML.querySelectorAll('.page-selector__btn')[0].classList.add('active');
        document.querySelector(".modal-overlay").style.display = "block";
        bodyComponent.render($slidePresentationHTML);

        this.isRendered = true;
    }

    render(slideNumber) {

        if (!this.isRendered) return;
        if (this.currentSlide === slideNumber) return;
        if (slideNumber >= this.slides.length) return;

        const $currentButton = document.querySelector('.slide-presentation').querySelectorAll('.page-selector__btn')[this.currentSlide];
        const $nextButton = document.querySelector('.slide-presentation').querySelectorAll('.page-selector__btn')[slideNumber];
        const $currentSlide = document.querySelector('.slide-presentation').querySelectorAll('.slide')[this.currentSlide];
        const $nextSlide = document.querySelector('.slide-presentation').querySelectorAll('.slide')[slideNumber];

        $currentSlide.classList.add('hiding');

        setTimeout(() => {
            $currentSlide.classList.remove('hiding');
            $currentSlide.classList.add('hidden');
            $nextSlide.classList.remove('hidden');
            $currentButton.classList.remove('active');
            $nextButton.classList.add('active');
        }, 200);

        this.currentSlide = slideNumber;
    }

    highlight(element) {
        
    }

    endPresentation() {
        document.querySelector(".slide-presentation").classList.add('hiding');
        document.querySelector(".modal-overlay").style.display = "none";
        setTimeout(() => {
            document.querySelector(".slide-presentation").remove();
        }, 200);

        localStorage.setItem("tutorial-seen", "true");
    }

}


const introductionSlide = new slide(
  'Bienvenido a PackeTTrino 🥳',
  './assets/favicon.svg',
  `PackeTTrino es una herramienta gráfica e interactiva para aprender redes de forma intuitiva.
    En este tutorial, aprenderás a crear dispositivos, conectarlos y simular una red completa. ¡Empecemos!`
);

introductionSlide.mediaShadow = "none";

const createAndConnectDevicesSlide = new slide(
  'Crear y conectar dispositivos 💻',
  './assets/tutorial/slide1.gif',
  `Para crear un dispositivo, arrástralo desde el panel inferior a la mesa de trabajo. 
  Puedes soltar ordenadores, switches, routers, y más. Cada uno tiene un menú propio para configurarlo.
  Prueba a conectar PCs a switches, switches a routers, etc. Los cables aparecerán visualmente sobre la mesa.`
);

const configureDevicesSlide = new slide(
  'Opciones de dispositivos ⚙️',
  './assets/tutorial/slideDeviceSettings.gif',
  `Haz clic derecho sobre un dispositivo para acceder a sus opciones de configuración.
  Verás distintas opciones dependiendo del dispositivo y de los paquetes instalados.`
);

const testNetworkSlide = new slide(
  'Prueba de Conectividad 📡',
  './assets/tutorial/slidePing.gif',
  `Una vez conectados y configurados los dispositivos, 
  prueba la red con <code>ping</code> entre equipos. Si todo está bien configurado, verás respuestas exitosas y sabrás que la red funciona.`
);

const nowItsYourTurnSlide = new slide(
  '¡Ahora te toca a ti! 🚀',
  './assets/tutorial/lastSlide.jpg',
  `Cierra este tutorial y prueba crear 
  tu propia topología de red. Explora las opciones, experimenta y si te pierdes… siempre puedes volver a este tutorial 
  o consultar la documentación oficial en GitHub. ¡Buena suerte, futuro experto en redes!`
);

const creditsSlide = new slide(
  'Créditos 👨‍💻',
  './assets/tutorial/ies.png',
  `Este aplicación fue desarrollada íntegramente por <br><a href="https://www.linkedin.com/in/josé-amín-pérez-alconchel-2191b430b" target="_blank">José Amín Pérez Alconchel</a> 
  como Proyecto de Fin de Grado en Administración de Sistemas Informáticos en Red en IES Mar de Cádiz.
  <br><br>
  Si te gusta el mundo de las redes también puedes encontrar información sobre los distintos protocolos y herramientas
  en <a href="https://www.fpgenred.es" target="_blank">www.fpgenred.es</a>`
);

creditsSlide.mediaShadow = "none";

const terminalSlide = new slide(
  'Terminal Integrada 🗔',
  './assets/tutorial/slideTerminal.gif',
  `La terminal integrada es una herramienta de comandos para interactuar con tu dispositivo. 
  Puedes usar comandos como <code>ping</code>, <code>curl</code>, <code>ifup</code> o configurar IPs y máscaras.
  Puedes hacer operaciones sobre el sistema de ficheros con comandos como <code>ls</code>, <code>cat</code> o <code>nano</code>.`
);

terminalSlide.mediaHeight = "250px";

const installPackagesSlide = new slide(
  'Instalar paquetes 📦',
  './assets/tutorial/slidePaquetes.gif',
  `Para instalar paquetes, puedes usar el comando <code>apt</code> desde la terminal integrada o arrastrar y soltar el paquete sobre el dispositivo.`
);

installPackagesSlide.mediaHeight = "250px";

const tutorial = new slidePresentation();

tutorial.addSlide(
    introductionSlide,
    createAndConnectDevicesSlide,
    configureDevicesSlide, 
    terminalSlide,
    testNetworkSlide,
    installPackagesSlide, 
    nowItsYourTurnSlide,
    creditsSlide
);

function startTutorial() {
    tutorial.startPresentation();
}
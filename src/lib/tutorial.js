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
'Welcome to PackeTTrino 🥳,

'./assets/favicon.svg',

`PackeTTrino is a graphical and interactive tool for learning about networks intuitively.

In this tutorial, you'll learn how to create devices, connect them, and simulate a complete network. Let's get started!`
);




introductionSlide.mediaShadow = "none";

const createAndConnectDevicesSlide = new slide(
  'Create and connect devices 💻',

'./assets/tutorial/slide1.gif',

`To create a device, drag it from the bottom panel to the workspace.
You can drop computers, switches, routers, and more. Each one has its own menu for configuration.
Try connecting PCs to switches, switches to routers, etc. The cables will appear visually on the workspace.`
);

const configureDevicesSlide = new slide(
 'Device Options ⚙️',

'./assets/tutorial/slideDeviceSettings.gif',

`Right-click on a device to access its configuration options.

You will see different options depending on the device and the installed packages.`
);

const testNetworkSlide = new slide(
 'Connectivity Test 📡',

'./assets/tutorial/slidePing.gif',

'Once the devices are connected and configured, test the network by <code>pinging</code> between devices.' 
    'If everything is configured correctly, you will see successful responses and know that the network is working.'
);

const nowItsYourTurnSlide = new slide(
 'Now it is your turn! 🚀',

'./assets/tutorial/lastSlide.jpg',

'Close this tutorial and try creating your own network topology.'
'Explore the options, experiment, and if you get lost... you can always come back to this tutorial'
'or consult the official documentation on GitHub. Good luck, future network expert!'
);

const creditsSlide = new slide(
'Credits 👨‍💻',

'./assets/tutorial/ies.png',

`This application was developed entirely by <br><a href="https://www.linkedin.com/in/josé-amín-pérez-alconchel-2191b430b" target="_blank">José Amín Pérez Alconchel</a>
as a Final Degree Project in Networked Computer Systems Administration at IES Mar de Cádiz.

<br>
<br>

If you like the world of networks, you can also find information about the different protocols and tools

at <a href="https://www.fpgenred.es" target="_blank">www.fpgenred.es</a>`
);

creditsSlide.mediaShadow = "none";

const terminalSlide = new slide(
 'Integrated Terminal 🗔',
'./assets/tutorial/slideTerminal.gif',

`The integrated terminal is a command-line tool for interacting with your device.

You can use commands like <code>ping</code>, <code>curl</code>, <code>ifup</code>, or configure IPs and subnet masks.

You can perform operations on the file system with commands like <code>ls</code>, <code>cat</code>, or <code>nano</code>.`
);

terminalSlide.mediaHeight = "250px";

const installPackagesSlide = new slide(
'Installing Packages 📦',

'./assets/tutorial/slidePackages.gif',

`To install packages, you can use the <code>apt</code> command from the integrated terminal or drag and drop the package onto the device.`
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

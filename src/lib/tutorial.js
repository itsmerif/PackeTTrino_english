class slide { 
    constructor(title, media, text ) {
        this.title = title;
        this.media = media;
        this.content = text;
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

    render(slideNumber) {

        const $slidePresentationHTML = document.createElement('div');

        if (!this.isRendered) {

            $slidePresentationHTML.classList.add('slide-presentation');

            this.slides.forEach((slide, index) => {
                $slidePresentationHTML.innerHTML += `
                    <div class="slide" id="slide-${index}">
                        <h1 class="slide__title">${slide.title}</h1>
                        <div class="main-content">
                            <img class="slide__media" src="${slide.media}" alt="media">
                            <p class="slide__content">${slide.content}</p>
                        </div>
                        <div class="page-selector">
                            ${
                                this.slides.map((slide, index) => {
                                    return `<button class="page-selector__btn ${index === slideNumber ? 'active' : ''}" 
                                            onclick="
                                            tutorial.render(${index});
                                            document.querySelector('.slide').querySelectorAll('.page-selector__btn').forEach(btn => btn.classList.remove('active'));
                                            this.classList.add('active');">${index + 1}</button>`;
                                }).join('')
                            }
                            <button class="end-presentation btn-modern-blue" onclick="tutorial.endPresentation();">Ya sé usar PackeTTrino!</button>
                        </div>
                    </div>`;
            });

            $slidePresentationHTML.querySelectorAll('.slide').forEach( $slide => $slide.classList.add('hidden') );
            $slidePresentationHTML.querySelectorAll('.slide')[slideNumber].classList.remove('hidden');
            bodyComponent.render($slidePresentationHTML);

            this.isRendered = true;

        }else {

            $slidePresentationHTML.querySelectorAll('.slide').forEach( $slide => $slide.classList.add('hidden') );
            $slidePresentationHTML.querySelectorAll('.slide')[slideNumber].classList.remove('hidden');
            
        }

        this.currentSlide = slideNumber;

    }

    renderNext() {
        this.render(this.currentSlide + 1);
    }

    renderPrevious() {
        this.render(this.currentSlide - 1);
    }

    endPresentation() {
        document.querySelector(".slide-presentation").remove();
    }

}


const page_1 = new slide(
    'Bienvenido a PackeTTrino pagina 1',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Anthonis_Mor_001.jpg/800px-Anthonis_Mor_001.jpg',
    `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
    qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
    consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,
    vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`
);

const page_2 = new slide(
    'Bienvenido a PackeTTrino pagina 2',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/HDols06.jpg/800px-HDols06.jpg',
    `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
    qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
    consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,
    vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`
);

const page_3 = new slide(
    'Bienvenido a PackeTTrino pagina 3',
    'https://upload.wikimedia.org/wikipedia/commons/6/61/Kepa_Amuchastegui_2023.jpg',
    `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
    qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
    consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,
    vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`  
);


const tutorial = new slidePresentation();

tutorial.addSlide(page_1, page_2, page_3,page_1, page_2);

function startTutorial() {

    tutorial.render(0);

}
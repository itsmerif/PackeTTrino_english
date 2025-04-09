class componentToken {

    constructor(element) {
        this.element = element;
    }
    
    render(componente) {

        const selections = {
            ".": () => document.querySelectorAll(`.${this.element.split(".")[1]}`),
            "#": () => document.querySelectorAll(`#${this.element.split("#")[1]}`),
        }

        const $elements = document.querySelectorAll(this.element) || selections[this.element.charAt(0)]() ;
        $elements.forEach( $element => $element.appendChild(componente()));
    
    }

    event(evento, resultado) {

        const selections = {
            ".": () => document.querySelectorAll(`.${this.element.split(".")[1]}`),
            "#": () => document.querySelectorAll(`#${this.element.split("#")[1]}`),
        }

        const $elements = document.querySelectorAll(this.element) || selections[this.element.charAt(0)]() ;     
        $elements.forEach( $element => $element.addEventListener(evento, resultado));

    }

}
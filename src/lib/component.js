class componentToken {

    constructor(element) {
        this.element = element;
    }
    
    render(componente) {
        const $elements = document.querySelectorAll(this.element);
        $elements.forEach( $element => { $element.appendChild(componente); });
    }

    event(evento, resultado) {
        const $elements = document.querySelectorAll(this.element);    
        $elements.forEach( $element => $element.addEventListener(evento, resultado));
    }

}
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

var html = new componentToken("html");
var body = new componentToken("body");
var root = new componentToken("#root");

root.render(itemBoard());
root.render(itemPanel());
body.render(pc_menu());
body.render(dns_server_menu());
body.render(dhcp_server_menu());
body.render(dhcp_agent_menu());
body.render(router_menu());
body.render(terminal());
body.render(browser());
body.render(packetTracer());
html.event("keydown", documentKeyboardHandler);

setTimeout(hideLoadingScreen, 1000);
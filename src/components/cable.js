function createCableObject(x1, y1, x2, y2, start, end) {

    const svg = document.getElementById("svg-board");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const x1Value = parseInt(x1.replace("px", ""));
    const y1Value = parseInt(y1.replace("px", ""));
    const x2Value = parseInt(x2.replace("px", ""));
    const y2Value = parseInt(y2.replace("px", ""));
    const midX = parseInt((x1Value + x2Value) / 2);
    const midY = parseInt((y1Value + y2Value) / 2);

    line.setAttribute("end-start", start);
    line.setAttribute("end-end", end);
    line.setAttribute("x1", x1Value);
    line.setAttribute("y1", y1Value);
    line.setAttribute("x2", x2Value);
    line.setAttribute("y2", y2Value);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "5");

    circle.setAttribute("onclick", "deleteCable(event)");
    circle.setAttribute("cx", midX);
    circle.setAttribute("cy", midY);
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "red");

    svg.appendChild(line);
    svg.appendChild(circle);


}

function deleteCable(event) {

    const circle = event.target;
    const cableObject = circle.previousElementSibling;
    const NetworkObject = document.getElementById(cableObject.getAttribute("end-start"));
    const switchObject = document.getElementById(cableObject.getAttribute("end-end"));

    if (NetworkObject.id.startsWith("pc-")) {

        NetworkObject.setAttribute("data-switch", "");  //eliminamos la referencia al switch en el pc
        NetworkObject.querySelector("img").draggable = true; //permitimos que el pc se pueda arrastrar

    }

    if (NetworkObject.id.startsWith("server-")) {

        NetworkObject.setAttribute("data-switch", "");  //eliminamos la referencia al switch en el pc
        NetworkObject.querySelector("img").draggable = true; //permitimos que el pc se pueda arrastrar

    }

    if (NetworkObject.id.startsWith("router-")) {

        if (NetworkObject.getAttribute("data-switch-enp0s3") === switchObject.id) {
            NetworkObject.setAttribute("data-switch-enp0s3", "");
        }
        if (NetworkObject.getAttribute("data-switch-enp0s8") === switchObject.id) {
            NetworkObject.setAttribute("data-switch-enp0s8", "");
        }
        if (NetworkObject.getAttribute("data-switch-enp0s9") === switchObject.id) {
            NetworkObject.setAttribute("data-switch-enp0s9", "");
        }

        NetworkObject.querySelector("img").draggable = true; //permitimos que el routerse pueda arrastrar

    }

    deleteMacEntry(switchObject.id, cableObject.getAttribute("end-start")); //eliminamos la entrada en la tabla MAC del switch

    if (isMacTableEmpty(switchObject.id)) {
        switchObject.querySelector("img").draggable = true; //permitimos que el switch se pueda arrastrar
    }

    circle.remove();
    cableObject.remove();
}

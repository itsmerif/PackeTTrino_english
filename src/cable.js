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

    circle.addEventListener("click", deleteCable);
    circle.setAttribute("cx", midX);
    circle.setAttribute("cy", midY);
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "red");

    svg.appendChild(line);
    svg.appendChild(circle);

    moveObject(x1Value, y1Value, x2Value, y2Value);

}


function deleteCable(event) {

    const circle = event.target;
    const cableObject = circle.previousElementSibling;
    const pcObject = document.getElementById(cableObject.getAttribute("end-start"));
    const switchObject = document.getElementById(cableObject.getAttribute("end-end"));
    
    pcObject.setAttribute("data-switch", "");  //eliminamos la referencia al switch en el pc
    deleteMacEntry(switchObject.id, pcObject.dataset.mac); //eliminamos la entrada en la tabla MAC del switch
    pcObject.querySelector("img").draggable = true; //permitimos que el pc se pueda arrastrar

    if (isMacTableEmpty(switchObject.id)) {
        switchObject.querySelector("img").draggable = true; //permitimos que el switch se pueda arrastrar
    }

    circle.remove();
    cableObject.remove();
}

function moveObject(x1, y1, x2, y2) {
    const svg = document.getElementById("svg-board");
    const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
    img.setAttribute("href", "/assets/cAddPacket.png");
    img.setAttribute("width", "50");
    img.setAttribute("height", "50");
    img.setAttribute("x", x1);
    img.setAttribute("y", y1); 
    svg.appendChild(img);
    let startTime;

    function animateMove(time) {
        if (!startTime) startTime = time;
        const progress = (time - startTime) / 2000;
        const currentX = x1 + (x2 - x1) * progress;
        const currentY = y1 + (y2 - y1) * progress;
        img.setAttribute("x", currentX);
        img.setAttribute("y", currentY);
        if (progress < 1) {
            requestAnimationFrame(animateMove);
        } else {
            svg.removeChild(img);
        }
    }

    requestAnimationFrame(animateMove);
}

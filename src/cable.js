function createCableObject(x1, y1, x2, y2, start, end) {

    const board = document.getElementsByClassName("board")[0];
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    svg.addEventListener("click", deleteCableConnection);
    svg.setAttribute("rope-start", start);
    svg.setAttribute("rope-end", end);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("style", "top: 0; left: 0;");
    svg.setAttribute("class", "cable");

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "5");

    svg.appendChild(line);
    board.appendChild(svg);

}


function deleteCableConnection(event) {

    event.preventDefault();
    event.stopPropagation();

    if (document.body.style.cursor.includes("cTargetX")) {
        const cableObject = event.target.closest(".cable");
        const pcObject = document.getElementById(cableObject.getAttribute("rope-start"));
        const switchObject = document.getElementById(cableObject.getAttribute("rope-end"));
        pcObject.setAttribute("data-switch", "");  //eliminamos la referencia al switch en el pc
        deleteMacEntry(switchObject.id,pcObject.dataset.mac);
        pcObject.querySelector("img").draggable = true; //permitimos que el pc se pueda arrastrar
        switchObject.querySelector("img").draggable = true; //permitimos que el switch se pueda arrastrar
        cableObject.remove();
    }

}
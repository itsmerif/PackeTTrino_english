function CableObject(x1, y1, x2, y2, start, end, interface = "enp0s3") {

    const svg = document.getElementById("svg-board");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");


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
    circle.setAttribute("end-start", start);
    circle.setAttribute("end-end", end);
    circle.setAttribute("cx", midX);
    circle.setAttribute("cy", midY);
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", "red");

    title.textContent = interface;

    circle.appendChild(title);
    svg.appendChild(line);
    svg.appendChild(circle);

}

function deleteCable(event) {

    const circle = event.target;
    const cableObject = circle.previousElementSibling;
    const $networkObject = document.getElementById(cableObject.getAttribute("end-start"));
    const $switchObject = document.getElementById(cableObject.getAttribute("end-end"));
    
    getInterfaces($networkObject.id).forEach(interface => {
        if ( $networkObject.getAttribute(`data-switch-${interface}`) === $switchObject.id) {
            $networkObject.setAttribute(`data-switch-${interface}`, "");
        }
    });

    $networkObject.querySelector("img").draggable = true;
    deleteMacEntry($switchObject.id, cableObject.getAttribute("end-start"));
    if (isMacTableEmpty($switchObject.id)) $switchObject.querySelector("img").draggable = true;
    circle.remove();
    cableObject.remove();
}

async function visualize(originObject, destinationObject, packet) {
    const $originObject = document.getElementById(originObject);
    const $destinationObject = document.getElementById(destinationObject);
    
    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff") {

        type = "broadcast";

    } else {
        type = "unicast";
        
    }

    await movePacket($originObject.style.left, $originObject.style.top, $destinationObject.style.left, $destinationObject.style.top, type);
}
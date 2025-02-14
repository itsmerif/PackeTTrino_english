function waitForMove() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

async function sendPacketVisual(packet) {

    const originIP = packet.origin;
    const destinationIP = packet.destination;

    if (!originIP || !destinationIP) {
        return;
    }

    if (originIP === destinationIP) {
        return;
    }

    const networkOriginObject = document.querySelector(`[data-ip="${originIP}"]`);
    const networkOriginObjectId = networkOriginObject.id;
    const networkOriginObjectNetmask = networkOriginObject.getAttribute("data-netmask");
    const networkOriginObjectMac = networkOriginObject.getAttribute("data-mac");
    const switchOriginObjectId = networkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchOriginObjectId);

    if (!switchOriginObjectId) {
        return;
    }

    if (getNetwork(originIP, networkOriginObjectNetmask) === getNetwork(destinationIP, networkOriginObjectNetmask)) {

        if (!isIpInARPTable(networkOriginObjectId, destinationIP)) { //no está en la tabla arp del origen

            await movePacket(networkOriginObject.style.left, networkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "broadcast");
            broadcastSwitch(switchOriginObjectId, networkOriginObjectId);
            await waitForMove();

            if (!isIpInNetwork(switchOriginObjectId, destinationIP)) { //ningun equipo conectado acepta la trama
                return;
            }

            const [networkDestinationObjectId, networkDestinationObjectmac] = isIpInNetwork(switchOriginObjectId, destinationIP);
            const networkDestinationObject = document.getElementById(networkDestinationObjectId);
            await movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "arpreply");
            await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkOriginObject.style.left, networkOriginObject.style.top, "arpreply");
            return;

        }

        const destinationMac = isIpInARPTable(networkOriginObjectId, destinationIP);       
        await movePacket(networkOriginObject.style.left, networkOriginObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");

        if (!isMacInMACTable(switchOriginObjectId, destinationMac)) { //no está la mac del destino en la tabla del switch

            broadcastSwitch(switchOriginObjectId, networkOriginObjectId);
            await waitForMove();

            if (!isMacinNetwork(switchOriginObjectId, destinationMac)) {
                return;
            }

            const networkDestinationObjectId = isMacinNetwork(switchOriginObjectId, destinationMac);
            const networkDestinationObject = document.getElementById(networkDestinationObjectId);

            if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) {
                return;
            }

            await movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
            await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkOriginObject.style.left, networkOriginObject.style.top, "unicast");

            return;
        }

        //la mac del destino está en la tabla del switch

        const networkDestinationObjectId = getDeviceFromMac(switchOriginObjectId, destinationMac);
        const networkDestinationObject = document.getElementById(networkDestinationObjectId);
        await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkDestinationObject.style.left, networkDestinationObject.style.top, "unicast");

        if (!macCheck(networkDestinationObjectId, destinationMac)) { //la mac de destino no coincide con la mac del equipo destino
            return;
        }

        if (!ipCheck(switchOriginObjectId, networkDestinationObjectId, destinationIP)) { //la ip de destino no coincide con la ip del equipo destino
            return;
        }

        //todo correcto

        await movePacket(networkDestinationObject.style.left, networkDestinationObject.style.top, switchOriginObject.style.left, switchOriginObject.style.top, "unicast");
        await movePacket(switchOriginObject.style.left, switchOriginObject.style.top, networkOriginObject.style.left, networkOriginObject.style.top, "unicast");
        return;

    }
}
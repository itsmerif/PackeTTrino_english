async function packetProcessor_Host(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(switchId, networkObjectId, packet);

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectInterface = switchToInterface(networkObjectId, switchId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);
    const activeServices = getAvailableServices(networkObjectId);

    //evaluamos la cadena INPUT del cortafuegos

    if (!firewallProcessorFilter(networkObjectId, packet, "INPUT", networkObjectInterface, "")) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

    //procesamiento por parte del KERNEL

    const replyPacket = await kernelProcessor(networkObjectId, packet, networkObjectInterface);

    if (replyPacket) {
        addPacketTraffic(replyPacket);
        await routing(networkObjectId, replyPacket, true);
        return;
    }

    //procesamiento por parte de SERVICIOS

    const responses = await serviceProcessor(networkObjectId, packet, networkObjectInterface);

    if (responses.length > 0) {

        const promises = responses.map(response => {
            const replyPacket = response.packet;
            return routing(networkObjectId, replyPacket, true);
        });

        await Promise.all(promises);
        
    }

}
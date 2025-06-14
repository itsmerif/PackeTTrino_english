async function packetProcessor_Router(switchId, networkObjectId, packet) {

    const $networkObject = document.getElementById(networkObjectId);
    const [networkObjectIp, networkObjectNetmask, networkObjectMac] = getInterfaceSwitchInfo(networkObjectId, switchId);
    const networkObjectInterface = switchToInterface(networkObjectId, switchId); // <-- obtenemos la interfaz de entrada
    const availableIps = getAvailableIps(networkObjectId); // <-- obtenemos la lista de IPs disponibles
    const activeServices = getAvailableServices(networkObjectId); // <-- obtenemos la lista de servicios activos

    //si la interfaz no está correctamente configurada, no se procesa nada

    if (!networkObjectIp || !networkObjectNetmask) return;

    //tratamiento del TTL del paquete

    if (packet.ttl) {

        packet.ttl--;

        if (packet.ttl < 1) {
            let newPacket = new IcmpTimeExceeded(networkObjectIp, packet.origin_ip, networkObjectMac, networkObjectMac);
            await routing(networkObjectId, newPacket);
            return;
        }

    }

    //gestor de conexiones entre el origen y el destino

    if (Object.hasOwn(connTrack, networkObjectId) && connTrack[networkObjectId][packet.origin_ip]) {
        packet.destination_ip = connTrack[networkObjectId][packet.origin_ip];
        delete connTrack[networkObjectId][packet.origin_ip];
    }

    //paquete dirigido a una IP del router, o es broadcast

    if (availableIps.includes(packet.destination_ip) || packet.destination_ip === "255.255.255.255") {

        //filtramos el paquete por la tabla filter con la cadena INPUT

        if (!firewallProcessorFilter(networkObjectId, packet, "INPUT", networkObjectInterface, "")) { 
            if (visualToggle) igniteFire(networkObjectId);
            return;
        }

        //procesamos el paquete por parte del KERNEL

        const replyPacket = await kernelProcessor(networkObjectId, packet, networkObjectInterface);

        if (replyPacket) {
            await routing(networkObjectId, replyPacket);
            return;
        }

        //procesamos el paquete por parte de SERVICIOS

        const responses = await serviceProcessor(networkObjectId, packet, networkObjectInterface);

        if (responses.length > 0) {

            const promises = responses.map(async (response) => {

                const replyPacket = response.packet;
                const outputInterface = response.outInterface;

                if (outputInterface !== "") {
                    addPacketTraffic(replyPacket);
                    await switchProcessor($networkObject.getAttribute(`data-switch-${outputInterface}`), networkObjectId, replyPacket);
                }

                await routing(networkObjectId, replyPacket);
                
            });

            await Promise.all(promises);

        }

        return;

    }

    //no enrutamos trafico broadcast

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") return;

    //se filtra por FORWARD

    if (!firewallProcessorFilter(networkObjectId, packet, "FORWARD", networkObjectInterface, "")) {
        if (visualToggle) igniteFire(networkObjectId);
        return;
    }

    await routing(networkObjectId, packet);

}
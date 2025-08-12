async function serviceProcessor(networkObjectId, packet, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableServices = getAvailableServices(networkObjectId);
    const responses = [];

    //servicio DHCP
    if (packet.protocol === "dhcp") {

        if (availableServices.includes("dhclient")) {

            const replyPacket = await dhclient_service(networkObjectId, packet, networkObjectInterface);

            if (replyPacket) {

                responses.push({
                    packet: replyPacket,
                    outInterface: networkObjectInterface
                });

            }

        }

        if (availableServices.includes("dhcpd")) {

            const replyPacket = await dhcpd_service(networkObjectId, packet, networkObjectInterface);

            if (replyPacket) {

                responses.push({
                    packet: replyPacket,
                    outInterface: networkObjectInterface
                })

            }

        }

        if (availableServices.includes("dhcrelay")) {

            const replyPacket = await dhcrelay_service(networkObjectId, packet, networkObjectInterface);

            if (replyPacket) {

                responses.push({
                    packet: replyPacket,
                    outInterface: (replyPacket.type === "offer" || replyPacket.type === "ack") ? getInfoFromIp(networkObjectId, replyPacket.giaddr)[0] : ""
                });

            }

        }

    }

    //servicio DNS
    if (packet.protocol === "dns" && packet.type === "request" && availableServices.includes("named")) {

        const replyPacket = await named_service(networkObjectId, packet);

        if (replyPacket) {

            responses.push({
                packet: replyPacket,
                outInterface: ""
            });

        }

    }

    //servicio HTTP
    if (packet.protocol === "http" && packet.type === "request" && availableServices.includes("apache2")) {

        const replyPacket = await apache_service(networkObjectId, packet);

        if (replyPacket) {

            responses.push({
                packet: replyPacket,
                outInterface: ""
            });

        }

    }

    return responses.filter(Boolean);

}
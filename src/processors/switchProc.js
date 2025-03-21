async function switchProcessor(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(networkObjectId, switchId, packet);

    const $switchObject = document.getElementById(switchId);

    // Guardamos la MAC de origen si no está en la tabla MAC del switch
    saveMac(switchId, networkObjectId, packet.origin_mac);

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchId, packet.destination_mac)) {

        //terminalMessage(`${switchId}: Saturación de puertos...`);
        order++;

        let devices = getDeviceTable($switchObject.id);

        await Promise.all(devices.map(async (device) => {
            if (device !== networkObjectId) {
                let duplicatePacket = structuredClone(packet);
        
                if (device.startsWith("pc-")) {
                    await packetProcessor_PC(switchId, device, duplicatePacket);
                } else if (device.startsWith("router-")) {
                    await packetProcessor_router(switchId, device, duplicatePacket);
                } else if (device.startsWith("dhcp-server-")) {
                    await packetProcessor_dhcp_server(switchId, device, duplicatePacket);
                } else if (device.startsWith("dhcp-relay-server-")) {
                    await packetProcessor_dhcp_relay_server(switchId, device, duplicatePacket);
                } else if (device.startsWith("dns-server-")) {
                    await packetProcessor_dns_server(switchId, device, duplicatePacket);
                }
            }
        }));

        return;
    }

    let device = getDeviceFromMac(switchId, packet.destination_mac);
    //terminalMessage(`${switchId}: Reenviando paquete a ${device}`);

    let duplicatePacket = structuredClone(packet);

    if (device.startsWith("pc-")) {
        await packetProcessor_PC(switchId, device, duplicatePacket);
    } else if (device.startsWith("router-")) {
        await packetProcessor_router(switchId, device, duplicatePacket);
    } else if (device.startsWith("dhcp-server-")) {
        await packetProcessor_dhcp_server(switchId, device, duplicatePacket);
    } else if (device.startsWith("dhcp-relay-server-")) {
        await packetProcessor_dhcp_relay_server(switchId, device, duplicatePacket);
    } else if (device.startsWith("dns-server-")) {
        await packetProcessor_dns_server(switchId, device, duplicatePacket);
    }

    return;
}
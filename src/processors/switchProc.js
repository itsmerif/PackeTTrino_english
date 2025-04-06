async function switchProcessor(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(networkObjectId, switchId, packet);

    const $switchObject = document.getElementById(switchId);
    saveMac(switchId, networkObjectId, packet.origin_mac);

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchId, packet.destination_mac)) {

        let devices = getDeviceTable($switchObject.id);

        await Promise.all(devices.map(async (device) => {
            if (device !== networkObjectId) {
                let duplicatePacket = structuredClone(packet);
                if (!device.startsWith("router-")) {
                    await packetProcessor_Host(switchId, device, duplicatePacket);
                }else {
                    await packetProcessor_router(switchId, device, duplicatePacket);
                }
            }
        }));

        return;
    }

    let device = getDeviceFromMac(switchId, packet.destination_mac);
    let duplicatePacket = structuredClone(packet);

    if (!device.startsWith("router-")) {
        await packetProcessor_Host(switchId, device, duplicatePacket);
    }else {
        await packetProcessor_router(switchId, device, duplicatePacket);
    }

    return;
}
async function switchProcessor(switchId, networkObjectId, packet) {

    if (visualToggle) await visualize(networkObjectId, switchId, packet);

    const $switchObject = document.getElementById(switchId);

    updateMacEntry(switchId, networkObjectId, packet.origin_mac); //guardamos la MAC del puerto origen

    if (packet.destination_mac === "ff:ff:ff:ff:ff:ff" || !isMacInMACTable(switchId, packet.destination_mac)) {

        const devices = getDeviceTable($switchObject.id);

        await Promise.all(devices.map(async (device) => {

            if (device !== networkObjectId) { //no se reenvía por el puerto origen
                const duplicatePacket = structuredClone(packet);
                await packetProcessor_Host(switchId, device, duplicatePacket);
            }

        }));

        return;

    }

    //la mac es conocida para el switch

    const device = getDeviceFromMac(switchId, packet.destination_mac);
    const duplicatePacket = structuredClone(packet);
    await packetProcessor_Host(switchId, device, duplicatePacket);

}
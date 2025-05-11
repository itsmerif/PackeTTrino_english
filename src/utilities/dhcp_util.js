/**ESTA FUNCION GESTIONA LA UTILIDAD DHCP DISCOVER DE UN EQUIPO CLIENTE */
async function dhcpDiscoverHandler(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectMac = $networkObject.getAttribute("mac-enp0s3");

    if (networkObjectIp !== "") {
        terminalMessage("Error: Este equipo ya tiene una IP asignada.", networkObjectId);
        return;
    }

    terminalMessage(`Listening on LPF/enp0s3/${networkObjectMac}`, networkObjectId);
    terminalMessage(`Sending on   LPF/enp0s3/${networkObjectMac}`, networkObjectId);
    terminalMessage("Sending on   Socket/fallback", networkObjectId);
    terminalMessage(`DHCPDISCOVER on enp0s3 to 255.255.255.255 port 67 interval 6`, networkObjectId);

    try {

        dhcpDiscoverFlag[networkObjectId] = false;
        dhcpRequestFlag[networkObjectId] = false;

        await dhcpDiscoverGenerator(networkObjectId);

        if (dhcpDiscoverFlag[networkObjectId] === false || dhcpRequestFlag[networkObjectId] === false) {
            terminalMessage("Error: No se pudo encontrar un servidor DHCP.", networkObjectId);
            return;
        }


    } catch (error) {

        terminalMessage("Error: " + error, networkObjectId);

    }

}

/**ESTA FUNCION GESTIONA LA UTILIDAD DHCP RENEW DE UN EQUIPO CLIENTE */
async function dhcpRenewHandler(networkObjectId, renewPhase = "T1") {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPREQUEST on enp0s3 to ${networkObjectDhcpServer} port 67`, networkObjectId);

    dhcpRequestFlag[networkObjectId] = false;

    try {
        await dhcpRequestGenerator(networkObjectId,renewPhase);
    } catch (error) {
        terminalMessage("Error: " + error, networkObjectId);
    }
    
}

/**ESTA FUNCION GESTIONA LA UTILIDAD DHCP RELEASE DE UN EQUIPO CLIENTE */
async function dhcpReleaseHandler(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute("ip-enp0s3");
    const networkObjectNetmask = $networkObject.getAttribute("netmask-enp0s3");
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPRELEASE of ${networkObjectIp} on enp0s3 to ${networkObjectDhcpServer} port 67`, networkObjectId);
    await dhcpReleaseGenerator(networkObjectId);
}
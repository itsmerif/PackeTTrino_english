/**ESTA FUNCION GESTIONA LA UTILIDAD DHCP DISCOVER DE UN EQUIPO CLIENTE */
async function dhcpDiscoverHandler(networkObjectId, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectMac = $networkObject.getAttribute(`mac-${networkObjectInterface}`);

    if (networkObjectIp !== "") {
        terminalMessage(`dhclient: La interfaz ${networkObjectInterface} ya tiene una IP asignada.`, networkObjectId);
        return;
    }

    terminalMessage(`Listening on LPF/${networkObjectInterface}/${networkObjectMac}`, networkObjectId);
    terminalMessage(`Sending on   LPF/${networkObjectInterface}/${networkObjectMac}`, networkObjectId);
    terminalMessage("Sending on   Socket/fallback", networkObjectId);
    terminalMessage(`DHCPDISCOVER on ${networkObjectInterface} to 255.255.255.255 port 67 interval 6`, networkObjectId);

    if (visualToggle) await minimizeTerminal();

        try {
            
            dhcpDiscoverFlag[networkObjectId] = false;
            dhcpRequestFlag[networkObjectId] = false;

            await dhcpDiscoverGenerator(networkObjectId, networkObjectInterface);

            if (dhcpDiscoverFlag[networkObjectId] === false || dhcpRequestFlag[networkObjectId] === false) {
                terminalMessage("\ndhclient: No se ha podido conectar con ningún servidor DHCP.", networkObjectId);
            }

        }catch (error) {

            terminalMessage("dhclient: No se ha podido ha podido conectar con ningún servidor DHCP.", networkObjectId);
            console.log(error);

        }

    if (visualToggle) await maximizeTerminal();

}

/**ESTA FUNCION GESTIONA LA UTILIDAD DHCP RENEW DE UN EQUIPO CLIENTE */
async function dhcpRenewHandler(networkObjectId, renewPhase, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("dhclient: Error en la configuración de red.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPREQUEST on ${networkObjectInterface} to ${networkObjectDhcpServer} port 67`, networkObjectId);

    try {
        
        dhcpRequestFlag[networkObjectId] = false;     
        await dhcpRequestGenerator(networkObjectId, renewPhase, networkObjectInterface);

    } catch (error) {

        terminalMessage("Error: " + error, networkObjectId);

    }
    
}

/**ESTA FUNCION GESTIONA LA UTILIDAD DHCP RELEASE DE UN EQUIPO CLIENTE */
async function dhcpReleaseHandler(networkObjectId, networkObjectInterface) {

    const $networkObject = document.getElementById(networkObjectId);
    const networkObjectIp = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
    const networkObjectNetmask = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
    const networkObjectDhcpServer = $networkObject.getAttribute("data-dhcp-server");

    if (!networkObjectIp || !networkObjectNetmask || !networkObjectDhcpServer) {
        terminalMessage("Error en la configuración de red.", networkObjectId);
        return;
    }

    terminalMessage(`DHCPRELEASE of ${networkObjectIp} on enp0s3 to ${networkObjectDhcpServer} port 67`, networkObjectId);

    if (visualToggle) await minimizeTerminal();

        try {
            await dhcpReleaseGenerator(networkObjectId, networkObjectInterface);
        } catch (error) {
            terminalMessage("Error: " + error, networkObjectId);
        }

    if (visualToggle) await maximizeTerminal();

}
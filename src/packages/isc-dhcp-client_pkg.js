function installDhclient($networkObject) {

    const networkObjectId = $networkObject.id;
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);

    terminalMessage("Installing DHCP Client...", networkObjectId);
        
        attr("dhclient", "true");

        const availableInterfaces = getInterfaces($networkObject);

        for (let iface of availableInterfaces) {
            attr(`data-dhclient-${iface}`, "false");
            attr(`data-dhcp-server-${iface}`, "");
            attr(`data-dhcp-lease-time-${iface}`, "");
            attr(`data-dhcp-current-lease-time-${iface}`, "");
            attr(`data-dhcp-flag-t1-${iface}`, "false");
            attr(`data-dhcp-flag-t2-${iface}`, "false");
        }

    terminalMessage("DHCP Client successfully installed.", networkObjectId);
}

function uninstallDhclient(networkObjectId) {

    terminalMessage("Uninstalling DHCP Client...", networkObjectId);

        const $networkObject = document.getElementById(networkObjectId);
        const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
        const availableInterfaces = getInterfaces($networkObject);

        rattr("dhclient");

        for (let iface of availableInterfaces) {
            rattr(
                `data-dhclient-${iface}`,
                `data-dhcp-server-${iface}`,
                `data-dhcp-lease-time-${iface}`,
                `data-dhcp-current-lease-time-${iface}`,
                `data-dhcp-flag-t1-${iface}`,
                `data-dhcp-flag-t2-${iface}`
            );
        }
    
    terminalMessage("DHCP Client successfully uninstalled..", networkObjectId);

}

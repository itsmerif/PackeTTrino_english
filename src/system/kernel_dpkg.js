function dpkg(networkObjectId, option, package) {
    
    const packagesToServices = {
        "apache2": "apache",
        "bind9": "named",
        "isc-dhcp-server": "dhcpd",
        "isc-dhcp-relay": "dhcrelay",
        "isc-dhcp-client": "dhclient",
    }

    const $networkObject = document.getElementById(networkObjectId);
    const service = packagesToServices[package];
    let log;

    if (!service) {
        terminalMessage("Error: El paquete " + package + " no tiene soporte.", networkObjectId);
        return "Error: El paquete " + package + " no tiene soporte.";
    }

    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (option === "install" && isServiceInstalled) {
        terminalMessage("Error: El servicio " + service + " ya está instalado.", networkObjectId);
        return "Error: El servicio " + service + " ya está instalado.";
    }

    if (option === "remove" && !isServiceInstalled) {
        terminalMessage("Error: El servicio " + service + " no está instalado.", networkObjectId);
        return "Error: El servicio " + service + " no está instalado.";
    }

    if (option === "install") log = dpkgInstaller(networkObjectId, package);
    if (option === "remove") log = dpkgUninstaller(networkObjectId, package);
    
    return log;

}


function dpkgInstaller(networkObjectId, package) {

    const installFunctions = {
        "apache2": () => installApache2(networkObjectId),
        "bind9": () => installBind9(networkObjectId),
        "isc-dhcp-server": () => installDhcpd(networkObjectId),
        "isc-dhcp-relay": () => installDhcprelay(networkObjectId),
        "isc-dhcp-client": () => installDhclient(networkObjectId),
    }

    let log = installFunctions[package]();
    return log;

}

function dpkgUninstaller(networkObjectId, package) {

    const uninstallFunctions = {
        "apache2": () => uninstallApache2(networkObjectId),
        "bind9": () => uninstallBind9(networkObjectId),
        "isc-dhcp-server": () => uninstallDhcpd(networkObjectId),
        "isc-dhcp-relay": () => uninstallDhcprelay(networkObjectId),
        "isc-dhcp-client": () => uninstallDhclient(networkObjectId),
    }

    let log = uninstallFunctions[package]();
    return log;
}
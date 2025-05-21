function dpkg(networkObjectId, option, package) {
    
    const $networkObject = document.getElementById(networkObjectId);

    const availablePackages = ["apache2", "bind9", "isc-dhcp-server", "isc-dhcp-relay", "isc-dhcp-client"];

    const packagesToServices = {
        "apache2": "apache2",
        "bind9": "named",
        "isc-dhcp-server": "dhcpd",
        "isc-dhcp-relay": "dhcrelay",
        "isc-dhcp-client": "dhclient",
    }

    if (!availablePackages.includes(package)) throw new Error(`Error: No se ha podido localizar el paquete ${package}.`);

    const service = packagesToServices[package];
    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (option === "install" && isServiceInstalled) throw new Error(`${package} ya está en su versión más reciente.`);

    if (option === "remove" && !isServiceInstalled) throw new Error(`Error: El paquete ${package} no está instalado, no se eliminará.`);

    if (option === "install") dpkgInstaller(networkObjectId, package);
    
    if (option === "remove") dpkgUninstaller(networkObjectId, package);
    
}


function dpkgInstaller(networkObjectId, package) {

    const $networkObject = document.getElementById(networkObjectId);

    const installFunctions = {
        "apache2": () => installApache2($networkObject),
        "bind9": () => installBind9($networkObject),
        "isc-dhcp-server": () => installDhcpd($networkObject),
        "isc-dhcp-relay": () => installDhcprelay($networkObject),
        "isc-dhcp-client": () => installDhclient($networkObject),
    }

    installFunctions[package]();

}

function dpkgUninstaller(networkObjectId, package) {

    const uninstallFunctions = {
        "apache2": () => uninstallApache2(networkObjectId),
        "bind9": () => uninstallBind9(networkObjectId),
        "isc-dhcp-server": () => uninstallDhcpd(networkObjectId),
        "isc-dhcp-relay": () => uninstallDhcprelay(networkObjectId),
        "isc-dhcp-client": () => uninstallDhclient(networkObjectId),
    }

    uninstallFunctions[package]();
    
}
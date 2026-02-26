function dpkg(networkObjectId, option, package) {

    const $networkObject = document.getElementById(networkObjectId);

    const availablePackages = ["apache2", "bind9", "isc-dhcp-server", "isc-dhcp-relay", "isc-dhcp-client", "amin-search"];

    const packagesToServices = {
        "apache2": "apache2",
        "bind9": "named",
        "isc-dhcp-server": "dhcpd",
        "isc-dhcp-relay": "dhcrelay",
        "isc-dhcp-client": "dhclient",
        "amin-search": "browser",
    }

    if (!availablePackages.includes(package)) throw new Error(`Error: Unable to locate packet ${package}.`);

    const service = packagesToServices[package];
    const isServiceInstalled = $networkObject.getAttribute(service) !== null;

    if (option === "install" && isServiceInstalled) throw new Error(`${package} is already the latest version.`);
    if (option === "remove" && !isServiceInstalled) throw new Error(`Error: The package ${package} is not installed; it will not be removed.`);
    if (option === "install") dpkgInstaller(package);
    if (option === "remove") dpkgUninstaller(package);

    function dpkgInstaller(package) {

        const installFunctions = {
            "apache2": () => installApache2($networkObject),
            "bind9": () => installBind9($networkObject),
            "isc-dhcp-server": () => installDhcpd($networkObject),
            "isc-dhcp-relay": () => installDhcprelay($networkObject),
            "isc-dhcp-client": () => installDhclient($networkObject),
            "amin-search": () => installBrowser($networkObject),
        }

        installFunctions[package]();

    }

    function dpkgUninstaller(package) {

        const uninstallFunctions = {
            "apache2": () => uninstallApache2(networkObjectId),
            "bind9": () => uninstallBind9(networkObjectId),
            "isc-dhcp-server": () => uninstallDhcpd(networkObjectId),
            "isc-dhcp-relay": () => uninstallDhcprelay(networkObjectId),
            "isc-dhcp-client": () => uninstallDhclient(networkObjectId),
            "amin-search": () => uninstallBrowser(networkObjectId),
        }

        uninstallFunctions[package]();

    }

}

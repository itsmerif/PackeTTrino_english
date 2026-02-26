function command_man(networkObjectId, topic) {
    const topicsMapper = {
        "man": manual_man,
        "ip": manual_ip,
        "nano": manual_nano,
        "apt": manual_apt,
        "arp": manual_arp,
        "dig": manual_dig,
        "dns": manual_dns,
        "mkdir": manual_mkdir,
        "touch": manual_touch,
        "ls": manual_ls,
        "rm": manual_rm,
        "cd": manual_cd,
        "cat": manual_cat,
        "ifup": manual_ifup,
        "ifdown": manual_ifdown,
        "iptables": manual_Iptables,
        "ping": manual_ping,
        "systemctl": manual_systemctl,
        "traceroute": manual_traceroute,
        "visual": manual_visual,
        "curl": manual_curl,
        "realnode": manual_realnode,
        "cp": manual_cp,
        "iface": manual_iface,
    }

    topicsMapper[topic]
        ? terminalMessage(topicsMapper[topic](), networkObjectId)
        : terminalMessage(`Error: unknown command ${topic}.`, networkObjectId);
}

/* ================= IP ================= */
function manual_ip(){
    let message = '';
    message += 'NAME\n';
    message += '    ip - Utility to configure IP addresses and routes in simulated network objects\n\n';

    message += 'SYNOPSIS\n';
    message += '    ip [ addr | route ] [ add | flush | del ] [ip/prefix] [dev interface] [via ip]\n\n';

    message += 'DESCRIPTION\n';
    message += '    The ip utility allows configuring IP addresses or routing rules in simulated\n';
    message += '    network objects. Operations are divided into two main categories:\n';
    message += '    addr    Manages IP addresses of interfaces\n';
    message += '    route   Manages IP routing rules\n\n';

    message += 'SUBCOMMANDS\n';
    message += '    addr\n';
    message += '        add [ip/prefix] dev [interface]\n';
    message += '            Assigns an IP address to a specific interface.\n';
    message += '        flush dev [interface]\n';
    message += '            Removes any IP address assigned to the interface.\n\n';

    message += '    route\n';
    message += '        add [ip/prefix|default] via [ip] dev [interface]\n';
    message += '            Adds a new route to a network or the default route.\n';
    message += '        del [ip/prefix]\n';
    message += '            Deletes a previously added route.\n\n';

    message += 'ARGUMENTS\n';
    message += '    ip/prefix\n';
    message += '        IP address and CIDR prefix length (e.g. 192.168.1.0/24).\n';
    message += '    default\n';
    message += '        Keyword for default route (equivalent to 0.0.0.0/0).\n';
    message += '    interface\n';
    message += '        Interface name in the network object (e.g. enp0s3).\n';
    message += '    ip\n';
    message += '        Valid IP address used as next hop (gateway).\n\n';

    message += 'EXAMPLES\n';
    message += '    ip addr add 192.168.1.1/24 dev enp0s3\n';
    message += '        Assigns IP 192.168.1.1/24 to interface enp0s3.\n';
    message += '    ip addr flush dev enp0s3\n';
    message += '        Removes all IPs assigned to enp0s3.\n';
    message += '    ip route add 10.0.0.0/8 via 192.168.1.254 dev enp0s3\n';
    message += '        Adds a route to 10.0.0.0/8 via gateway 192.168.1.254.\n';
    message += '    ip route del 10.0.0.0/8\n';
    message += '        Deletes the route to 10.0.0.0/8.\n\n';

    message += 'NOTES\n';
    message += '    If the subcommand (add, flush, del) is omitted, the current configuration is shown.\n\n';

    message += 'COMMON ERRORS\n';
    message += '    - Using add together with flush/del\n';
    message += '    - Unknown interfaces\n';
    message += '    - Invalid CIDR format\n\n';

    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n Translated to English by itsmeRiF (2026)';
    return message;
}

/* ================= NANO ================= */
function manual_nano(){
    let message = '';
    message += 'NAME\n';
    message += '    nano - Text editor to view and modify files in simulated network objects\n\n';

    message += 'SYNOPSIS\n';
    message += '    nano [file]\n\n';

    message += 'DESCRIPTION\n';
    message += '    Opens a file in the simulator visual editor, allowing the user to view\n';
    message += '    and modify its content. The file must exist within the object filesystem.\n\n';

    message += 'ARGUMENTS\n';
    message += '    file\n';
    message += '        Relative or absolute path of the file to open (e.g. /etc/config.txt).\n\n';

    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n Translated to English by itsmeRiF (2026)';
    return message;
}

/* ================= APT ================= */
function manual_apt() {
    let message = '';
    message += 'NAME\n';
    message += '    apt - Package management tool in simulated systems\n\n';

    message += 'SYNOPSIS\n';
    message += '    apt [install|remove] <package-name>\n\n';

    message += 'DESCRIPTION\n';
    message += '    The apt command allows installing or removing packages inside the system.\n';
    message += '    It uses dpkg as a low-level package manager.\n\n';

    message += 'SUBCOMMANDS\n';
    message += '    install <package>\n';
    message += '        Installs the specified package and its associated services.\n\n';

    message += '    remove <package>\n';
    message += '        Removes the specified package and its associated services.\n\n';

    message += 'ARGUMENTS\n';
    message += '    <package>\n';
    message += '        Name of the package to install or remove. Available packages:\n';
    message += '            apache2, bind9, isc-dhcp-server, isc-dhcp-relay, isc-dhcp-client\n\n';

    message += 'OPERATION\n';
    message += '    - Validates the subcommand\n';
    message += '    - Displays informational messages\n';
    message += '    - Executes dpkg to install or remove the package\n\n';

    message += 'EXAMPLES\n';
    message += '    apt install apache2\n';
    message += '        Installs apache2.\n';
    message += '    apt remove bind9\n';
    message += '        Removes bind9.\n\n';

    message += 'PACKAGE–SERVICE RELATIONSHIP\n';
    message += '    apache2           -> apache\n';
    message += '    bind9             -> named\n';
    message += '    isc-dhcp-server   -> dhcpd\n';
    message += '    isc-dhcp-relay    -> dhcrelay\n';
    message += '    isc-dhcp-client   -> dhclient\n\n';

    message += 'AUTHOR\n';
    message += '    Network simulator developed by Amin Pérez (2025).\n Translated to English by itsmeRiF (2026)';
    return message;
}

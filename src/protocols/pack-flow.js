function command_sp(id, args) {

    let ip; let netmask; let switchId; let destination; let packet; let type;
    const $networkObject = document.getElementById(id);

    if (args.length > 4 || args.length < 3) {
        terminalMessage("Error: Sintaxis: sp [source (only for routers)] <destination> <packet-type>");
        return;
    }

    if (args.length === 3) {
        destination = args[1];
        type = args[2];
        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }
    }

    if (args.length === 4) {
        destination = args[2];
        type = args[3];
        if (!destination.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)) {
            terminalMessage("Error: La IP de destino introducida no es válida.");
            return;
        }
    }

    if (!id.startsWith("router-")) { //solo tiene 1 interfaz de red

        if (args.length === 4) {
            terminalMessage("Error: Origen Personalizable no admitido. Sintaxis: sp [source (only for routers)] <destination> <packet-type>");
            return;
        }

        ip = $networkObject.getAttribute("data-ip");
        netmask = $networkObject.getAttribute("data-netmask");
        switchId = $networkObject.getAttribute("data-switch");

    }

    if (id.startsWith("router-")) { //tiene 3 interfaces de red

        if (args.length === 4) { //tenemos el argumento con la ip de origen
            //comprobamos que sea una ip de alguna interfaz de red
            switch (args[1]) {
                case $networkObject.getAttribute("ip-enp0s3"):
                    ip = $networkObject.getAttribute("ip-enp0s3");
                    netmask = $networkObject.getAttribute("netmask-enp0s3");
                    switchId = $networkObject.getAttribute("data-switch-enp0s3");
                    break;
                case $networkObject.getAttribute("ip-enp0s8"):
                    ip = $networkObject.getAttribute("ip-enp0s8");
                    netmask = $networkObject.getAttribute("netmask-enp0s8");
                    switchId = $networkObject.getAttribute("data-switch-enp0s8");
                    break;
                case $networkObject.getAttribute("ip-enp0s9"):
                    ip = $networkObject.getAttribute("ip-enp0s9");
                    netmask = $networkObject.getAttribute("netmask-enp0s9");
                    switchId = $networkObject.getAttribute("data-switch-enp0s9");
                    break;
                default:
                    terminalMessage("Error: La IP de origen introducida no es válida.");
                    return;
            }
        } else {
            ip = $networkObject.getAttribute("ip-enp0s3");
            netmask = $networkObject.getAttribute("netmask-enp0s3");
            switchId = $networkObject.getAttribute("data-switch-enp0s3");
        }
    }

    if (!ip || !netmask) {
        terminalMessage("Error: No se ha configurado el equipo.");
        return;
    }

    switch (type) {
        case "arp":
            packet = { origin: ip, destination: destination, protocol: "arp", ttl: 64, type: "request" };
            break;
        case "icmp":
            packet = { origin: ip, destination: destination, protocol: "icmp", ttl: 64, type: "echo-request", code: 0 };
            break;
        default:
            terminalMessage("Error: Tipo de paquete no reconocido.");
            break;
    }

    terminalMessage("Generando paquete..." + JSON.stringify(packet));
}
function iscDhcpRelayInterpreter(networkObjectId, content) {

    const $networkObject = document.getElementById(networkObjectId);

    //eliminamos las lineas comentadas
    const contentWithoutComments = content
    .split("\n")
    .map(line => line.trim())
    .filter(line => !line.startsWith("#"))
    .join("\n");

    //quitamos los saltos de línea y los espacios
    const contentLines = contentWithoutComments
    .split("\n")
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(line => !line.startsWith("#"))

    contentLines.forEach(line => {

        if (line.startsWith("INTERFACES=")) {

            const fileInterfaces = (splitLast(splitFirst(splitFirst(line, "=")[1], '"')[1], '"')[0])
            .split(" ")
            .map(iface => iface.trim())
            .filter(iface => iface !== "");

            const availableInterfaces = getInterfaces(networkObjectId);

            if (!fileInterfaces.every(fileInterface => availableInterfaces.includes(fileInterface))) {
                throw new Error(`/default/isc-dhcp-server: no se reconocen las interfaces ${fileInterfaces.filter(fileInterface => !availableInterfaces.includes(fileInterface))}`);
            }

            $networkObject.setAttribute("dhcrelay-listen-on-interfaces", fileInterfaces.join(","));

        }

        if (line.startsWith("SERVERS=")) {

            const fileServer = (splitLast(splitFirst(splitFirst(line, "=")[1], '"')[1], '"')[0])
            .split(" ")[0].trim()

            if (!isValidIp(fileServer)) throw new Error(`/default/isc-dhcp-server: no se reconoce el servidor ${fileServer}`);

            $networkObject.setAttribute("dhcrelay-main-server", fileServer);

        }

    });

}
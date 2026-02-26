function command_iface(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);
    const selectedOptions = {};

    const $OPTS = catchopts([
        "--add",
        "--del:",
    ], args);

    const optionHandlers = {

        "--add": () => {
            selectedOptions["--add"] = true;
            addInterface(networkObjectId);
            terminalMessage(`iface: Interface enp0s${maxIfaceIndex(networkObjectId)} added.`, networkObjectId);
        },

        "--del": () => {
            
            selectedOptions["--del"] = true;

            const iface = ($OPTS["--del"]);

            if (!iface) throw new Error(`Error: You must specify an interface to delete.`);

            if (iface === "all") {

                for (let iface of availableInterfaces.slice(1)) {
                    
                    if ($networkObject.getAttribute(`data-switch-${iface}`) !== "") {
                        terminalMessage(`iface: The interface ${iface} cannot be deleted because it has an active connection.`, networkObjectId);
                        continue;
                    }

                    deleteInterface(networkObjectId, iface);
                    terminalMessage(`iface: Interface ${iface} deleted.`, networkObjectId);

                }

                return;

            }

            if (iface === "enp0s3") {
                throw new Error(`Error: The interface ${iface} cannot be deleted.`);
            }

            if (!availableInterfaces.includes(iface)) {
                throw new Error(`Error: The interface "${iface}" does not exist.`);
            }

            if ($networkObject.getAttribute(`data-switch-${iface}`) !== "") {
                throw new Error(`Error: The interface ${iface} has an active connection.`);
            }

            deleteInterface(networkObjectId, iface);
            terminalMessage(`iface: Interface ${iface} deleted.`, networkObjectId);

        },

    }


    try {

        for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

        if (isEmptyObject(selectedOptions)) throw new Error(`Error: A valid option must be specified.`);

    } catch (error) {

        terminalMessage(`iface: ${error.message}`, networkObjectId);

    }

}

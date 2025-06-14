function command_iface(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    const availableInterfaces = getInterfaces(networkObjectId);
    const selectedOptions = {};

    const $OPTS = catchopts([
        "add",
        "del:",
    ], args);

    const optionHandlers = {

        "add": () => {
            selectedOptions["add"] = true;
            addInterface(networkObjectId);
            terminalMessage(`iface: Interfaz enp0s${maxIfaceIndex(networkObjectId)} agregada.`, networkObjectId);
        },

        "del": () => {
            
            selectedOptions["del"] = true;

            const iface = ($OPTS["del"]);

            if (!iface) throw new Error(`Error: Debes especificar una interfaz a eliminar.`);

            if (iface === "all") {

                for (let iface of availableInterfaces.slice(1)) {
                    
                    if ($networkObject.getAttribute(`data-switch-${iface}`) !== "") {
                        terminalMessage(`iface: No se pude eliminar la interfaz ${iface} porque tiene una conexión activa.`, networkObjectId);
                        continue;
                    }

                    deleteInterface(networkObjectId, iface);
                    terminalMessage(`iface: Interfaz ${iface} eliminada.`, networkObjectId);

                }

                return;

            }

            if (iface === "enp0s3") {
                throw new Error(`Error: La interfaz ${iface} no se puede eliminar.`);
            }

            if (!availableInterfaces.includes(iface)) {
                throw new Error(`Error: La interfaz "${iface}" no existe.`);
            }

            if ($networkObject.getAttribute(`data-switch-${iface}`) !== "") {
                throw new Error(`Error: La interfaz ${iface} tiene una conexión activa.`);
            }

            deleteInterface(networkObjectId, iface);
            terminalMessage(`iface: Interfaz ${iface} eliminada.`, networkObjectId);

        },

    }


    try {

        for (option in $OPTS) if (optionHandlers[option]) optionHandlers[option]();

        if (isEmptyObject(selectedOptions)) throw new Error(`Error: Se debe especificar una opción valida.`);

    } catch (error) {

        terminalMessage(`iface: ${error.message}`, networkObjectId);

    }

}
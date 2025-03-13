function command_dig(dataId, args) {

    // sintaxis: dig < -x ip | domain >

    if (args[1] === "-x") {

        if (args.length !== 3) {
            terminalMessage("Error: Sintaxis -> dig -x &lt;ip&gt;");
            return;
        }

        dig(dataId, args[2], true);

    } else {

        if (args.length !== 2) {
            terminalMessage("Error: Sintaxis -> dig <domain>");
            return;
        }
        
        dig(dataId, args[1], true);

    }

}
function command_apt(networkObjectId, args) {

    const option =  args[1];
    const package = args[2];
    const availableOptions = ["install", "remove"];

    if (args.length !== 3) {
        terminalMessage("Argument error: Syntax: apt [install|remove] &lt;package name&gt;", networkObjectId);
        return;
    }

    if (!availableOptions.includes(args[1])) {
        terminalMessage(`Error: Invalid operation: ${args[1]}`, networkObjectId);
        return;
    }

    terminalMessage(`Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done`,networkObjectId);

    try {

        dpkg(networkObjectId, option, package);

    }catch(error) {

        terminalMessage(error.message, networkObjectId);
        
    }
    
}

function command_mkdir(dataId, args) {
    let fileSystem = new FileSystem(dataId);
    let directoryPath = args[1].split("/").slice(1);
    let folderName = directoryPath.pop();

    try {
        fileSystem.mkdir(folderName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, dataId);
    }
}

function command_touch(dataId, args) { // touch /etc/network/file.txt

    if (args.length !== 2) {
        terminalMessage("Error de argumentos. Sintaxis: touch &lt;archivo&gt;", dataId);
        return;
    }

    let fileSystem = new FileSystem(dataId);
    let directoryPath = args[1].split("/").slice(1);
    let fileName = directoryPath.pop();

    try {
        fileSystem.touch(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, dataId);
    }

}

function command_ls(dataId, args) {
    let fileSystem = new FileSystem(dataId);
    args.shift();
    fileSystem.ls(...args);
}

function command_rm(dataId, arg) {

    if (arg.length !== 2) {
        terminalMessage("Error de argumentos. Sintaxis: rm &lt;archivo&gt;", dataId);
        return;
    }

    let directoryPath = arg[1].split("/").slice(1);
    let fileName = directoryPath.pop();
    console.log(directoryPath, fileName);
    let fileSystem = new FileSystem(dataId);

    try {
        fileSystem.rm(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, dataId);
    }
}
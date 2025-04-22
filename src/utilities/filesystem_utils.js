function command_mkdir(networkObjectId, pathInput) {

    const $networkObject = document.getElementById(networkObjectId);
    let directoryPath;

    if (pathInput.startsWith("/")) {
        directoryPath = pathInput.split("/").slice(1);
    } else {
        directoryPath = $PWD;
        pathInput.split("/").map(dir => directoryPath.push(dir));
    } 
    
    let fileSystem = new FileSystem($networkObject);
    let folderName = directoryPath.pop();

    try {
        fileSystem.mkdir(folderName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

function command_touch(dataId, args) {

    if (args.length !== 2) {
        terminalMessage("Error de argumentos. Sintaxis: touch &lt;archivo&gt;", dataId);
        return;
    }

    const $networkObject = document.getElementById(dataId);
    let fileSystem = new FileSystem($networkObject);
    let directoryPath = args[1].split("/").slice(1);
    let fileName = directoryPath.pop();

    try {
        fileSystem.touch(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, dataId);
    }

}

function command_ls(dataId, args) {
    const $networkObject = document.getElementById(dataId);
    let fileSystem = new FileSystem($networkObject);
    args.shift();
    fileSystem.ls(...args);
}

function command_rm(dataId, arg) {

    if (arg.length !== 2) {
        terminalMessage("Error de argumentos. Sintaxis: rm &lt;archivo&gt;", dataId);
        return;
    }

    const $networkObject = document.getElementById(dataId);
    let directoryPath = arg[1].split("/").slice(1);
    let fileName = directoryPath.pop();
    let fileSystem = new FileSystem($networkObject);

    try {
        fileSystem.rm(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, dataId);
    }
}

function command_cd(networkObjectId, pathInput) {
    
    const $networkObject = document.getElementById(networkObjectId);

    let directoryPath;

    if (pathInput.startsWith("/")) {
        directoryPath = pathInput.split("/").slice(1);
    } else {
        directoryPath = $PWD;
        pathInput.split("/").map(dir => directoryPath.push(dir));
    }

    let fileSystem = new FileSystem($networkObject);

    try {
        fileSystem.cd(directoryPath);
        document.querySelector(".terminal-component").querySelector("#terminal-prompt").innerHTML = "root@debian:" + pathInput + "#";
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}
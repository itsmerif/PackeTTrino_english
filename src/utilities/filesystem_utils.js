function command_mkdir(networkObjectId, pathInput) {

    const $networkObject = document.getElementById(networkObjectId);
    let fileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder(pathInput);
    let folderName = directoryPath.pop();

    try {
        fileSystem.mkdir(folderName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

function command_touch(networkObjectId, pathInput) {

    const $networkObject = document.getElementById(networkObjectId);
    let fileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder(pathInput);
    let fileName = directoryPath.pop();

    try {
        fileSystem.touch(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

function command_ls(networkObjectId, args) {

    const $networkObject = document.getElementById(networkObjectId);
    let fileSystem = new FileSystem($networkObject);
    fileSystem.ls(...args);
}

function command_rm(networkObjectId, inputPath) {

    const $networkObject = document.getElementById(networkObjectId);
    let fileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder(inputPath);
    let fileName = directoryPath.pop();

    try {
        fileSystem.rm(fileName, directoryPath);
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }
}

function command_cd(networkObjectId, pathInput) {
    
    const $networkObject = document.getElementById(networkObjectId);
    let directoryPath = pathBuilder(pathInput);       
    let fileSystem = new FileSystem($networkObject);

    try {
        fileSystem.cd(directoryPath);
        document.querySelector(".terminal-component").querySelector("#terminal-prompt").innerHTML = `root@debian:/${directoryPath.join("/")}#`;
    }catch(e) {
        terminalMessage(e.message, networkObjectId);
    }

}

function command_cat(networkObjectId, file) {

    const $networkObject = document.getElementById(networkObjectId);
    let fileSystem = new FileSystem($networkObject);
    let directoryPath = pathBuilder(file);
    let fileName = directoryPath.pop();

    try {
        let fileContent = fileSystem.open(fileName, directoryPath);
        terminalMessage(fileContent, networkObjectId);
    } catch (e) {
        terminalMessage(e.message, networkObjectId);
    }

}

function pathBuilder(pathInput) {

    let path;
    
    if (pathInput.startsWith("/")) {
        path = pathInput.split("/").slice(1);
    } else {
        path = [...$PWD];
        pathInput.split("/").map(dir => path.push(dir)); 
    }

    return path;
}
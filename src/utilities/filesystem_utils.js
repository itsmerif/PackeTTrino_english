function command_mkdir(dataId, arg) {
    const $networkObject = document.getElementById(dataId);
    const fileSystem = JSON.parse($networkObject.getAttribute("filesystem"));
    let fullPath = arg.split("/").slice(1);
    let folderName = fullPath.pop();
    let currentDirectory = fileSystem["/"];
    for (let i = 0; i < fullPath.length; i++) currentDirectory = currentDirectory[fullPath[i]];
    currentDirectory[folderName] = {};
    $networkObject.setAttribute("filesystem", JSON.stringify(fileSystem));
    console.log(fileSystem);
}

function command_touch(dataId, args) { // touch /etc/network/file.txt

    if (args.length !== 2) {
        terminalMessage("Error de argumentos. Sintaxis: touch &lt;archivo&gt;", dataId);
        return;
    }

    let directoryPath = args[1].split("/").slice(1);
    let fileName = directoryPath.pop();
    let fileSystem = new FileSystem(dataId);
    fileSystem.touch(fileName, directoryPath);
}

function command_rm(dataId, arg) {

}

function command_mv(dataId, arg) {

}

function command_ls(dataId, args) {
    let fileSystem = new FileSystem(dataId);
    args.shift();
    fileSystem.ls(...args);
}

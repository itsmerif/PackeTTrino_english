class FileSystem {

    constructor(itemId) {
        this.itemId = itemId;
        this.structure = JSON.parse(document.getElementById(itemId).getAttribute("filesystem"));
        this.dirpermissions = "drwx ";
        this.filepermissions = "-rwx ";
        this.owner = "root ";
        this.group = "root ";
    }

    compile () {
        document.getElementById(this.itemId).setAttribute("filesystem", JSON.stringify(this.structure));
    }

    ls (...options) {
        
        const networkObjectId = this.itemId;
        const rootDirectory = this.structure["/"];
        const dirpermissions = (options.includes("-l")) ? this.dirpermissions : "";
        const filepermissions = (options.includes("-l"))  ? this.filepermissions : "";
        const owner = (options.includes("-l")) ? this.owner : "";
        const group = (options.includes("-l")) ? this.group : "";
        const isRecursive = options.includes("-R");
        let output = [];
        recursiveSearch(rootDirectory, networkObjectId, "/");

        function recursiveSearch(objt, networkObjectId, currentPath) {
            for (const key in objt) {
                if (objt[key] instanceof Object) {
                    output.push(dirpermissions + owner + group + (currentPath + "/" + key).slice(1));
                    if (isRecursive) recursiveSearch(objt[key], networkObjectId, currentPath + "/" + key);
                } else {
                    output.push(filepermissions + owner + group + (currentPath + "/" + key).slice(1));
                }
            }
        }

        if (!options.includes("-l")) output = output.join(" ");
        else output = output.join("\n");

        terminalMessage(output, networkObjectId);
        
    }

    touch (fileName, directoryPath) {

        const fileSystem = this.structure;
        let currentDirectory = fileSystem["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} ya existe`);
        currentDirectory[fileName] = "";
        this.compile();

    }


    rm (fileName, directoryPath) {

        const fileSystem = this.structure;
        let currentDirectory = fileSystem["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} no existe`);
        delete currentDirectory[fileName];
        this.compile();

    }

    mkdir(folderName, directoryPath) {

        const fileSystem = this.structure;
        let currentDirectory = fileSystem["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!Object.hasOwn(currentDirectory, directoryPath[i])) {
                currentDirectory[directoryPath[i]] = {};
            }else if (!(currentDirectory[directoryPath[i]] instanceof Object)) {
                throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            }
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (Object.hasOwn(currentDirectory, folderName)) throw new Error(`El directorio ${folderName} ya existe`);
        currentDirectory[folderName] = {};
        this.compile();

    }
}


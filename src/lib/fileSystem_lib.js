class FileSystem {

    constructor($item) {
        this.item = $item;
        this.structure = JSON.parse((this.item).getAttribute("filesystem"));
        this.dirpermissions = "drwx ";
        this.filepermissions = "-rwx ";
        this.owner = "root ";
        this.group = "root ";
    }

    compile () {
        (this.item).setAttribute("filesystem", JSON.stringify(this.structure));
    }

    getPWD() {
        let currentDirectory = (this.structure)["/"];
        for (let i = 0; i < $PWD.length; i++) currentDirectory = currentDirectory[$PWD[i]];
        return currentDirectory;
    }
    
    ls (...options) {
        
        const currentDirectory = this.getPWD();
        const dirpermissions = (options.includes("-l")) ? this.dirpermissions : "";
        const filepermissions = (options.includes("-l"))  ? this.filepermissions : "";
        const owner = (options.includes("-l")) ? this.owner : "";
        const group = (options.includes("-l")) ? this.group : "";
        const isRecursive = options.includes("-R");
        let output = [];
        
        recursiveSearch(currentDirectory, "/");
 
        function recursiveSearch(objt, currentPath) {
            for (const key in objt) {
                if (objt[key] instanceof Object) {
                    output.push(dirpermissions + owner + group + (currentPath + "/" + key).slice(1));
                    if (isRecursive) recursiveSearch(objt[key], currentPath + "/" + key);
                } else {
                    output.push(filepermissions + owner + group + (currentPath + "/" + key).slice(1));
                }
            }
        }

        if (!options.includes("-l")) output = output.join(" ");
        else output = output.join("\n");

        terminalMessage(output, (this.item).id);
        
    }

    touch (fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

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

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} no existe`);
        delete currentDirectory[fileName];
        this.compile();

    }

    rmdir (folderName, directoryPath) { 
        
        let currentDirectory = (this.structure)["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!Object.hasOwn(currentDirectory, directoryPath[i])) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, folderName)) throw new Error(`El directorio ${folderName} no existe`);
        delete currentDirectory[folderName];
        this.compile();

    }

    mkdir (folderName, directoryPath) { 

        let currentDirectory = (this.structure)["/"];

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

    cd (directoryPath) {

        let currentDirectory = this.structure["/"];
        let provisionalPWD = [];

        directoryPath.forEach(dir => {
            if (!dir) return;
            if (!Object.hasOwn(currentDirectory, dir)) throw new Error(`El directorio ${dir} no existe`);
            if (!(currentDirectory[dir] instanceof Object)) throw new Error(`${dir} no es un directorio`);
            currentDirectory = currentDirectory[dir];
            provisionalPWD.push(dir);
        });

        $PWD = [...provisionalPWD];

    }


    //gestion de archivos

    read (fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} no existe`);

        return currentDirectory[fileName]; 

    }


    write (fileName, directoryPath, content) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} no existe`);

        currentDirectory[fileName] = content;

        this.compile();

    }
}
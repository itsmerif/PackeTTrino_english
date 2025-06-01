class FileSystem {

    constructor($item) {
        this.item = $item;
        this.structure = JSON.parse((this.item).getAttribute("filesystem"));
        this.dirpermissions = "drwx ";
        this.filepermissions = "-rwx ";
        this.owner = "root ";
        this.group = "root ";
    }

    compile() {
        (this.item).setAttribute("filesystem", JSON.stringify(this.structure));
    }

    getPWD() {
        let currentDirectory = (this.structure)["/"];
        for (let i = 0; i < $PWD.length; i++) currentDirectory = currentDirectory[$PWD[i]];
        return currentDirectory;
    }

    deepCopy(obj) {
        if (typeof obj !== "object" || obj === null) return obj;

        const copy = {};
        for (const key in obj) {
            if (Object.hasOwn(obj, key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }
        return copy;
    }

    ls(...options) {

        const currentDirectory = this.getPWD();
        const dirpermissions = (options.includes("-l")) ? this.dirpermissions : "";
        const filepermissions = (options.includes("-l")) ? this.filepermissions : "";
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

        return output;

    }

    touch(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (Object.hasOwn(currentDirectory, fileName)) throw new Error(`No se puede crear el archivo ${fileName}: ya existe`);
        currentDirectory[fileName] = "";
        this.compile();

    }

    cp(fileName, destinationFileName, directoryPath, destinationPath, recursive = false) {

        let currentDirectory = this.structure["/"];
        let destinationDirectory = this.structure["/"];

        //verficamos el archivo origen

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (typeof currentDirectory[directoryPath[i]] !== "object") throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo o directorio ${fileName} no existe`);

        const source = currentDirectory[fileName];

        if (typeof source === "object" && !recursive) throw new Error(`-r no especificado; omitiendo el directorio ${fileName}`);

        //verficamos el directorio destino

        for (let i = 0; i < destinationPath.length; i++) {
            if (!destinationDirectory[destinationPath[i]]) throw new Error(`El directorio ${destinationPath[i]} no existe`);
            if (typeof destinationDirectory[destinationPath[i]] !== "object") throw new Error(`El directorio ${destinationPath[i]} no es un directorio`);
            destinationDirectory = destinationDirectory[destinationPath[i]];
        }

        if (!recursive && typeof destinationDirectory[destinationFileName] === "object") {
            throw new Error(`No se puede sobreescribir el archivo ${destinationFileName}: es un directorio`);
        }

        destinationDirectory[destinationFileName] = (typeof source === "object") ? this.deepCopy(source): source;

        this.compile();
        
    }

    rm(fileName, directoryPath) {

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

    rmdir(folderName, directoryPath) {

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

    mkdir(folderName, directoryPath) {

        let currentDirectory = (this.structure)["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!Object.hasOwn(currentDirectory, directoryPath[i])) {
                currentDirectory[directoryPath[i]] = {};
            } else if (!(currentDirectory[directoryPath[i]] instanceof Object)) {
                throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            }
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (Object.hasOwn(currentDirectory, folderName)) throw new Error(`El directorio ${folderName} ya existe`);
        currentDirectory[folderName] = {};
        this.compile();

    }

    cd(directoryPath) {

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

    read(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} no existe`);
        if (currentDirectory[fileName] instanceof Object) throw new Error(`No se puede abrir el archivo ${fileName}: es un directorio`);

        return currentDirectory[fileName];

    }


    write(fileName, directoryPath, content) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) throw new Error(`El directorio ${directoryPath[i]} no existe`);
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) throw new Error(`El directorio ${directoryPath[i]} no es un directorio`);
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) throw new Error(`El archivo ${fileName} no existe`);
        if (currentDirectory[fileName] instanceof Object) throw new Error(`No se puede escribir sobre el archivo ${fileName}: es un directorio`);

        currentDirectory[fileName] = content;

        this.compile();

    }


    isDirectory(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) return false;
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) return false;
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) return false;
        if (!(currentDirectory[fileName] instanceof Object)) return false;


        return true;

    }

    isFile(fileName, directoryPath) {

        let currentDirectory = this.structure["/"];

        for (let i = 0; i < directoryPath.length; i++) {
            if (!currentDirectory[directoryPath[i]]) return false;
            if (!(currentDirectory[directoryPath[i]] instanceof Object)) return false;
            currentDirectory = currentDirectory[directoryPath[i]];
        }

        if (!Object.hasOwn(currentDirectory, fileName)) return false;
        if (currentDirectory[fileName] instanceof Object) return false;

        return true;

    }
    
}


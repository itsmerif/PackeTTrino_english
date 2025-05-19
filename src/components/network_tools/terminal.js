function terminal() {

    const $terminal = document.createElement("div");
    $terminal.classList.add("terminal-component", "draggable-modal");
    $terminal.id = "terminal-network";
    $terminal.setAttribute("data-id", "");

    $terminal.innerHTML = `

        <div class="window-frame">Terminal</div>

        <p>
            <span id="terminal-prompt"></span>
            <input type="text" class="terminal-input" autofocus>
        </p>

        <pre class="terminal-output"></pre>

        <div class="editor-wrapper" style="display: none;">
            <div class="editor-buttons">
                <p><span>^S</span>Guardar y Salir</p>
            </div>
            <p class="file-editor-error"></p>
            <textarea class="file-editor" data-file=""></textarea>
            <div class="editor-frame"> <span></span>       
        </div>
    `;

    $terminal.addEventListener("keydown", terminalKeyboard);
    $terminal.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $terminal.addEventListener("click", clickTerminal);
    $terminal.querySelector(".terminal-input").addEventListener("keydown", unixParser);
    $terminal.querySelector(".terminal-output").addEventListener("click", clickTerminal);
    $terminal.querySelector(".terminal-output").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor-error").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor-error").addEventListener("mouseup", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("mousedown", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("mouseup", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("click", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("dragstart", event => { event.stopPropagation(); });
    $terminal.querySelector(".file-editor").addEventListener("keydown", fileEditorKeyboard);

    return $terminal;

}

function clickTerminal(event) {
    const terminal = event.target.closest(".terminal-component");
    const input = terminal.querySelector("input");
    input.focus();
}

function terminalMessage(message, networkObjectId, isHtml = true) {
    const $terminal = document.querySelector(".terminal-component");
    const $output = document.querySelector(".terminal-output");
    if (window.getComputedStyle($terminal).display === "none") return;
    if ($terminal.dataset.id !== networkObjectId) return;
    if (isHtml) $output.innerHTML += `${message}\n`;
    else $output.textContent += `${message}\n`;
}

function terminalKeyboard(event) {

    if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        clearInterval(window.pingInterval);
        document.querySelector(".terminal-output").innerHTML = "";
    }

    if (event.key === "Escape") {
        closeTerminal(event);
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentCommandIndex === 0) return;
        currentCommandIndex--;
        document.querySelector(".terminal-component").querySelector("input").value = terminalBuffer[currentCommandIndex];
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (currentCommandIndex === terminalBuffer.length) return;
        currentCommandIndex++;
        document.querySelector(".terminal-component").querySelector("input").value = terminalBuffer[currentCommandIndex] || "";
    }
}

async function minimizeTerminal() {
    return new Promise(resolve => {
        const $terminal = document.querySelector(".terminal-component");
        if (!$terminal || window.getComputedStyle($terminal).display === "none") return resolve();
        const rect = $terminal.getBoundingClientRect();
        const targetWidth = rect.width * 0.3;
        const targetHeight = rect.height * 0.3;
        const windowHeight = window.innerHeight;
        $terminal.style.transition = "all 1s ease-in-out";
        $terminal.style.width = `${targetWidth}px`;
        $terminal.style.height = `${targetHeight}px`;
        $terminal.style.top = `${windowHeight - targetHeight}px`;
        $terminal.style.left = "100%";
        $terminal.style.transform = "translate(-100%, 0)";
        $terminal.addEventListener("transitionend", resolve, { once: true });
    });
}

async function maximizeTerminal() {
    return new Promise(resolve => {
        const $terminal = document.querySelector(".terminal-component");
        if (!$terminal || window.getComputedStyle($terminal).display === "none") return resolve();
        $terminal.style.transition = "all 1s ease-in-out";
        $terminal.style.width = "1000px";
        $terminal.style.height = "500px";
        $terminal.style.top = "40%";
        $terminal.style.left = "50%";
        $terminal.style.transform = "translate(-50%, -50%)";
        $terminal.addEventListener("transitionend", () => {
            $terminal.style.transition = "none";
            resolve();
        }, { once: true });
    });
}

function showTerminal(event) {
    event.stopPropagation();
    const $networkObject = event.target.closest(".item-dropped");
    const $terminal = document.querySelector(".terminal-component");
    const $advOptsModal = $networkObject.querySelector(".advanced-options-modal");
    $terminal.setAttribute("data-id", $networkObject.id);
    $terminal.querySelector("#terminal-prompt").innerHTML = `root@${$networkObject.id}:/#`;	
    $terminal.style.display = "block";
    $terminal.querySelector(".terminal-input").focus();
    $advOptsModal.style.display = "none";
}

function closeTerminal(event) {
    event.preventDefault();
    const $terminal = document.querySelector(".terminal-component");
    clearInterval(window.pingInterval);
    terminalBuffer = [];
    currentCommandIndex = 0;
    document.querySelector(".terminal-output").innerHTML = "";
    $terminal.querySelector("input").value = "";
    $terminal.querySelector("#terminal-prompt").innerHTML = "root@debian:/#";
    $PWD = [];
    $terminal.style.top = "40%";
    $terminal.style.left = "50%";
    $terminal.style.transform = "translate(-50%, -50%)";
    $terminal.style.display = "none";
}

function fileEditorKeyboard(event) {

    event.stopPropagation();

    const $terminal = document.querySelector(".terminal-component");
    const $fileEditorContainer = $terminal.querySelector(".editor-wrapper");
    const $fileEditorArea = $fileEditorContainer.querySelector(".file-editor");
    const fileContent = $fileEditorArea.value; //<-- obtenemos el contenido del editor
    const networkObjectId = $terminal.dataset.id; //<-- obtenemos el id del objeto del dataset de la terminal
    const $networkObject = document.getElementById(networkObjectId);
    const fileFullPath = $fileEditorArea.getAttribute("data-file"); //<-- obtenemos la ruta completa del archivo

    if (event.ctrlKey && event.key === "s") {

        event.preventDefault();

        const networkElementFileSystem = new FileSystem($networkObject); //<-- creamos un objeto de sistema de archivos
        let directoryPath = pathBuilder(fileFullPath); //<-- creamos la ruta completa del archivo
        let fileName = directoryPath.pop(); //<-- obtenemos el nombre del archivo

        try {
            networkElementFileSystem.write(fileName, directoryPath, fileContent); //<-- intentamos volcar el contenido del archivo sobre el sistema de archivos
            $fileEditorContainer.style.display = "none"; //<-- ocultamos el editor
            $terminal.querySelector("input").focus(); //<-- colocamos el cursor en el input del terminal al salir del editor
        } catch (e) {
            terminalMessage(e.message, networkObjectId);
            console.log(e);
        }

    }

    if (event.key === "Tab") {
        event.preventDefault();
        let start = $fileEditorArea.selectionStart;
        let end = $fileEditorArea.selectionEnd;
        $fileEditorArea.value = $fileEditorArea.value.substring(0, start) + "\t" + $fileEditorArea.value.substring(end);
        $fileEditorArea.selectionStart = $fileEditorArea.selectionEnd = start + 1;
    }

}

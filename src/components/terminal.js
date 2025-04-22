function terminal() {

    const $terminal = document.createElement("div");
    $terminal.classList.add("terminal-component", "draggable-modal");
    $terminal.id = "terminal-network";
    $terminal.setAttribute("data-id", "");

    $terminal.innerHTML = `
        <p>
            <span id="terminal-prompt">root@debian:/# </span>
            <input type="text" class="terminal-input" autofocus>
        </p>

        <pre class="terminal-output"></pre>

        <div class="editor-container" style="display: none;">

        <div class="editor-buttons">
            <p><span>^S</span>Guardar y Salir</p>
        </div>

        <p class="file-editor-error"></p>

        <textarea class="file-editor" data-file=""></textarea>

        <div class="editor-frame"> <span></span> </div>
    `;

    $terminal.addEventListener("keydown", terminalKeyboard);
    $terminal.addEventListener("mousedown", dragModal);
    $terminal.addEventListener("click", clickTerminal);
    $terminal.querySelector(".terminal-input").addEventListener("keydown", sendCommand);
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

function terminalMessage(message, networkObjectId) {
    const $terminal = document.querySelector(".terminal-component");
    const $output = document.querySelector(".terminal-output");
    if (window.getComputedStyle($terminal).display === "none") return;
    if ($terminal.dataset.id !== networkObjectId) return;
    $output.innerHTML += `${message}\n`;
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
    const networkObject = event.target.closest(".item-dropped");
    const terminal = document.querySelector(".terminal-component");
    terminal.setAttribute("data-id", networkObject.id);
    terminal.style.display = "block";
    const modal = networkObject.querySelector(".advanced-options-modal");
    modal.style.display = "none";
}

function closeTerminal(event) {
    event.preventDefault();
    const $terminal = document.querySelector(".terminal-component");
    clearInterval(window.pingInterval);
    terminalBuffer = [];
    currentCommandIndex = 0;
    document.querySelector(".terminal-output").innerHTML = "";
    $terminal.querySelector("input").value = "";
    $terminal.style.top = "40%";
    $terminal.style.left = "50%";
    $terminal.style.transform = "translate(-50%, -50%)";
    $terminal.style.display = "none";
}

function fileEditorKeyboard(event) {

    event.stopPropagation();

    const textarea = event.target;

    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        closeEditor();
        document.querySelector(".terminal-component").querySelector("input").focus();
    }

    if (event.key === "Tab") {
        event.preventDefault();
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    }

}

function closeEditor() {

    const fileEditor = document.querySelector(".file-editor");
    const fileName = fileEditor.getAttribute("data-file");
    const networkObjectId = document.querySelector(".terminal-component").dataset.id;

    if (fileName === "/etc/network/interfaces") {

        if (networkObjectId.startsWith("router-")) {
            routingTableRestore(document.querySelector(".terminal-component").dataset.id);
        }

        try {

            parserNetworkFile();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }

        return;

    }

    if (fileName === "/etc/resolv.conf") {

        try {

            parserResolvConf();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }
    }

    if (fileName === "/var/www/html/index.html") {
        savewebContent();
        document.querySelector(".editor-container").style.display = "none";
        document.querySelector(".file-editor").value = "";
    }

    if (fileName === "/etc/hosts") {

        try {

            parserEtcHosts();
            document.querySelector(".editor-container").style.display = "none";
            document.querySelector(".file-editor").value = "";
            terminalMessage("El archivo se ha cargado correctamente.");

        } catch (error) {

            document.querySelector(".file-editor-error").innerHTML = error.message;
            document.querySelector(".file-editor-error").style.display = "block";

            setTimeout(() => {
                document.querySelector(".file-editor-error").style.display = "none";
            }, 3000);

        }

    }
}
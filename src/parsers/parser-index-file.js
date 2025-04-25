function loadApacheIndexContent(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);
    const isApacheInstalled = $networkObject.getAttribute("apache") !== null;

    if (!isApacheInstalled) {
        terminalMessage("Error: El archivo /var/www/html/index.html no se puede editar porque el servidor web no está instalado.", networkObjectId);
        return;
    }

    const fileEditorContainer = document.querySelector(".editor-container");
    let webContent = $networkObject.getAttribute("web-content");
    let content = fileEditorContainer.querySelector(".file-editor");
    content.value = deMinifyHTML(webContent);
    fileEditorContainer.style.display = "block";
    content.focus();
}


function savewebContent() {
    const $networkObject = document.getElementById(document.querySelector(".terminal-component").dataset.id);
    const fileEditor = document.querySelector(".file-editor");
    let fileContent = fileEditor.value;
    fileContent = minifyHTML(fileContent);
    $networkObject.setAttribute("web-content", fileContent);
}

function minifyHTML(html) {
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/>\s+</g, '><');
    html = html.replace(/\s+>/g, '>');
    html = html.replace(/<\s+/g, '<');
    html = html.replace(/\s{2,}/g, ' ');
    html = html.replace(/\s*=\s*/g, '=');

    html = html.replace(/="([^"]+)"/g, (match, p1) => {
        if (!/\s/.test(p1) && /^[a-zA-Z0-9_\-]+$/.test(p1)) {
            return '=' + p1;
        }
        return match;
    });

    return html;
}

function deMinifyHTML(html) {

    let indentLevel = 0;
    const indentChar = '  '; 
    let output = '';
    let inTag = false;
    let inContent = false;
    let tagBuffer = '';

    function getIndent() {
        return indentChar.repeat(indentLevel);
    }

    for (let i = 0; i < html.length; i++) {
        const char = html[i];
        const nextChar = html[i + 1] || '';

        if (char === '<' && nextChar !== '/') {

            if (inContent) {
                output += '\n';
                inContent = false;
            }

            inTag = true;
            tagBuffer = char;

            output += '\n' + getIndent();

            if (!['!', '?'].includes(nextChar)) {
                indentLevel++;
            }
        }

        else if (char === '<' && nextChar === '/') {
            inTag = true;
            tagBuffer = char;

            indentLevel = Math.max(0, indentLevel - 1);

            output += '\n' + getIndent();
        }


        else if (char === '>') {
            inTag = false;
            tagBuffer += char;

            tagBuffer = formatTagAttributes(tagBuffer);
            output += tagBuffer;
            tagBuffer = '';

            if (html[i - 1] === '/' || html[i - 2] === '/') {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            inContent = true;
        }

        else if (inTag) {
            tagBuffer += char;
        }
        else {

            if (char === ' ' && html[i - 1] === ' ') {
                continue;
            }
            output += char;
            inContent = true;
        }
    }

    return output;
}

function formatTagAttributes(tag) {

    if (tag.startsWith('<!--') || tag.startsWith('<!DOCTYPE')) {
        return tag;
    }

    const matches = tag.match(/^<\/?([^\s>\/]+)(.*)>$/);
    if (!matches) return tag;

    const [_, tagName, attributesStr] = matches;

    if (!attributesStr.trim()) {
        return tag;
    }

    const formattedAttrs = attributesStr
        .replace(/=([^\s"'][^\s>]*)/g, '="$1"') 
        .replace(/\s+/g, ' ')
        .replace(/\s*=\s*/g, '=');

    const attrs = formattedAttrs.trim().split(' ').filter(Boolean);

    if (attrs.length > 3) {
        const indent = '  ';
        return `<${tagName}\n${indent}${attrs.join(`\n${indent}`)}>`;
    }

    return `<${tagName} ${attrs.join(' ')}>`;
}

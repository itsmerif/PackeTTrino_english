function installApache2($networkObject) {

    terminalMessage("Instalando Apache...", $networkObject.id);

    const defaultApacheContent = `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <title>Apache2 PackeTTrino Default Page: It works</title>
                <style type="text/css" media="screen">
                    :root {
                    --primary-color: #2563eb;
                    --accent-color: #ea580c;
                    --text-color: #1e293b;
                    --light-bg: #f8fafc;
                    --dark-bg: #0f172a;
                    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }

                    * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    }

                    body {
                    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                    line-height: 1.6;
                    color: var(--text-color);
                    background-color: var(--light-bg);
                    padding: 0 20px;
                    }

                    .main_page {
                    max-width: 900px;
                    margin: 40px auto;
                    background-color: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow);
                    }

                    .page_header {
                    display: flex;
                    align-items: center;
                    padding: 24px;
                    background-color: var(--dark-bg);
                    color: white;
                    }

                    .page_header img {
                    height: 40px;
                    margin-right: 16px;
                    }

                    .page_header .floating_element {
                    font-size: 24px;
                    font-weight: 600;
                    }

                    .content_section {
                    padding: 24px;
                    }

                    .section_header_red {
                    color: var(--accent-color);
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 24px;
                    position: relative;
                    padding-bottom: 10px;
                    }

                    .section_header_red::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 60px;
                    height: 4px;
                    background-color: var(--primary-color);
                    border-radius: 2px;
                    }

                    .content_section_text p {
                    margin-bottom: 16px;
                    font-size: 16px;
                    }

                    b {
                    color: var(--primary-color);
                    font-weight: 600;
                    }

                    tt {
                    background-color: #e2e8f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    }

                    @media (max-width: 768px) {
                    .main_page {
                        margin: 20px auto;
                    }
                    
                    .page_header {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .page_header img {
                        margin-right: 0;
                        margin-bottom: 12px;
                    }
                    }
                </style>
            </head>
            <body>
                <div class="main_page">
                    <div class="page_header floating_element">
                        <img src="./assets/favicon.svg" alt="Ubuntu Logo" class="floating_element"/>
                        <span class="floating_element">
                            Página por Defecto de Apache2 PackeTTrino
                        </span>
                    </div>
                    <div class="content_section floating_element">
                        <div class="section_header section_header_red">
                            <div id="about"></div>
                            ¡Funciona!
                        </div>
                        <div class="content_section_text">
                            <p>
                                Esta es la página de bienvenida predeterminada que se utiliza para comprobar el correcto
                                funcionamiento del servidor Apache2 PackeTTrino tras su instalación.
                                Está basada en la página equivalente de Debian, de la cual se deriva el paquete de Apache en Ubuntu.
                                Si puedes leer esta página, significa que el servidor HTTP Apache PackeTTrino instalado en este sitio está funcionando correctamente.
                                Deberías <b>reemplazar este archivo</b> (ubicado en
                                <tt>/var/www/html/index.html</tt>) antes de continuar usando tu servidor HTTP.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
    `;
    const attr = (attribute, value) => $networkObject.setAttribute(attribute, value);
    const fileSystem = new FileSystem($networkObject);

    attr("apache2", "true"); 
    fileSystem.mkdir("html", ["var", "www"]); 
    fileSystem.touch("index.html", ["var", "www", "html"]); 
    fileSystem.write("index.html", ["var", "www", "html"], defaultApacheContent.replace(/\s+/g, " "));
    if ($networkObject.id.startsWith("pc-")) $networkObject.querySelector("img").src = "./assets/board/www-server.svg";

    terminalMessage("Apache instalado correctamente.", $networkObject.id);
}

function uninstallApache2(networkObjectId) {

    terminalMessage("Desinstalando Apache...", networkObjectId);

    const $networkObject = document.getElementById(networkObjectId);
    const rattr = (...attributes) => attributes.forEach(attribute => $networkObject.removeAttribute(attribute));
    const networkObjectFileSystem = new FileSystem($networkObject);

    networkObjectFileSystem.rmdir("www", ["var"]);
    rattr("apache2");
    if ($networkObject.id.startsWith("pc-")) $networkObject.querySelector("img").src = "./assets/board/pc.svg";

    terminalMessage("Apache desinstalado correctamente.", networkObjectId);
}

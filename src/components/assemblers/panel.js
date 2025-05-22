async function itemPanel() {

    const $panel = document.createElement("section");
    const $itemsContainer = document.createElement("div");
    $panel.id = "item-panel";
    $panel.classList.add("hidden");
    $panel.innerHTML = `<input type="file" id="fileInput" accept=".ptt" style="display: none;">`;
    $itemsContainer.classList.add("item-panel-elements");
    $itemsContainer.appendChild(dynamicRoutingButton());
    $panel.appendChild($itemsContainer);

    const panelItems = [
        {
            "name": "upload",
            "image": "./assets/panel/upload.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Subir Archivo de Red"
        },
        {
            "name": "load",
            "image": "./assets/panel/load.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Cargar archivo"
        },
        {
            "name": "download",
            "image": "./assets/panel/download.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Descargar Archivo de Red"
        },
        {
            "name": "pc",
            "image": "./assets/panel/pc.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "PC"
        },
        {
            "name": "router",
            "image": "./assets/panel/router.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "Router"
        },
        {
            "name": "switch",
            "image": "./assets/panel/switch.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "Switch"
        },
        {
            "name": "dhcpserver",
            "image": "./assets/panel/dhcpserver.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "Servidor DHCP"
        },
        {
            "name": "dhcprelay",
            "image": "./assets/panel/dhcprelay.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "Agente DHCP"
        },
        {
            "name": "dnsserver",
            "image": "./assets/panel/dnsserver.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "Servidor DNS"
        },
        {
            "name": "isc-dhcp-server",
            "image": "./assets/panel/isc-dhcp-server.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "isc-dhcp-server"
        },
        {
            "name": "isc-dhcp-client",
            "image": "./assets/panel/isc-dhcp-client.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "isc-dhcp-client"
        },
        {
            "name": "isc-dhcp-relay",
            "image": "./assets/panel/isc-dhcp-relay.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "isc-dhcp-relay"
        },
        {
            "name": "bind9",
            "image": "./assets/panel/bind9.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "bind9"
        },
        {
            "name": "apache2",
            "image": "./assets/panel/apache2.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "apache2"
        },
        {
            "name": "text",
            "image": "./assets/panel/annotation.svg",
            "draggable": true,
            "size": "100%",
            "tooltip": "Anotación"
        },
        {
            "name": "traffic",
            "image": "./assets/panel/traffic.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Tráfico de Red"
        },
        {
            "name": "ping",
            "image": "./assets/panel/bus.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Simulador de Ping"
        },
        {
            "name": "animation-controls",
            "image": "./assets/panel/animationControls.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Controles de Animación"
        },
        {
            "name": "settings",
            "image": "./assets/panel/settings.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Opciones Avanzadas"
        },
        {
            "name": "hide-panel",
            "image": "./assets/panel/hide-panel.svg",
            "draggable": false,
            "size": "100%",
            "tooltip": "Ocultar el panel"
        }
    ]


    //agregamos los items del panel
    panelItems.forEach(panelItem => {
        const $itemElement = document.createElement("article");
        $itemElement.classList.add("item", "hidden", panelItem.name);
        $itemElement.draggable = panelItem.draggable;
        $itemElement.ondragstart = dragStart;
        $itemElement.innerHTML = `
            <img src="${panelItem.image}" 
            alt="${panelItem.name}"
            draggable="${panelItem.draggable}" 
            style="width: ${panelItem.size}; height: ${panelItem.size};" />`;

        $itemElement.setAttribute("onmouseenter", `showTooltip("${panelItem.tooltip}", event)`);
        $itemElement.setAttribute("onmouseleave", `deleteTooltip(event)`);
        $itemsContainer.appendChild($itemElement);
    });

    //agregamos eventos
    $panel.querySelector("#fileInput").addEventListener("change", fileInputChangeHandler);
    $panel.querySelector(".ping").addEventListener("click", icmpTryoutStart);
    $panel.querySelector(".dynrouting").addEventListener("click", () => bodyComponent.render(DynamicRoutingMenu()));
    $panel.querySelector(".settings").addEventListener("click", generalOptionsHandler);
    $panel.querySelector(".traffic").addEventListener("click", showPacketTraffic);
    $panel.querySelector(".upload").addEventListener("click", () => $panel.querySelector("#fileInput").click());
    $panel.querySelector(".load").addEventListener("click", fileInputLoadHandler);
    $panel.querySelector(".download").addEventListener("click", downloadState);
    $panel.querySelector(".animation-controls").addEventListener("click", function () { document.querySelector(".video-controls").classList.toggle("hidden"); });
    $panel.querySelector(".hide-panel").addEventListener("click", hidePanel);

    return $panel;

}

function hidePanel() {

    const $panel = document.querySelector("#item-panel");
    const $hideButton = $panel.querySelector(".hide-panel");
    const $panelItems = $panel.querySelectorAll(".item");

    if (!$hideButton.classList.contains("active")) {

        $panelItems.forEach($item => {
            if (!$item.classList.contains("hide-panel")) $item.style.display = "none";
        });

        $panel.querySelector(".hide-panel").classList.add("active");
    
    } else {

        $panelItems.forEach($item => {
            if (!$item.classList.contains("hide-panel")) $item.style.display = "flex";
        });

        $panel.querySelector(".hide-panel").classList.remove("active");

    }

}
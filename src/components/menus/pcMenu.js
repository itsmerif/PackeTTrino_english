function pc_menu() {

    const $menu = document.createElement("form");

    $menu.classList.add("pc-form", "hidden", "modal", "draggable-modal");

    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <section class="basic-section">

            <div class="form-item">
                <label for="iface">Interface:</label>
                <select id="iface" name="iface"></select>
            </div>

            <div class="form-item">
                <label for="ip">IP Address (ipv4):</label>
                <input type="text" id="ip" name="ip">
            </div>

            <div class="form-item">
                <label for="netmask">Subnet mask:</label>
                <input type="text" id="netmask" name="netmask">
            </div>

            <div class="form-item">
                <label for="gateway">Default Gateway:</label>
                <input type="text" id="gateway" name="gateway">
            </div>
    
            <div class="form-item">
                <label for="dns-server">DNS Server:</label>
                <input type="text" id="dns-server" name="dns-server">
            </div>

        </section>

        <section class="modes-wrapper">

            <div class="form-item" id="dhcp-mode">
                <label for="dhcp-toggle"> DHCP Mode: </label>
                <input class="btn-toggle" type="checkbox" id="dhcp-toggle" name="dhcp-toggle">
            </div>

            <div class="form-item hidden" id="web-server-mode">
                <label for="web-server-toggle"> Web Server: </label>
                <input class="btn-toggle" type="checkbox" id="web-server-toggle" name="web-server-toggle">
            </div>

        </section>

        <section class="button-container">

            <div id="dhcp-buttons">
                <button class="btn-modern-blue" type="submit" id="get-btn">Obtain IP Address/button>
                <button class="btn-modern-blue" type="submit" id="renew-btn">Renew IP Address</button>
                <button class="btn-modern-blue" type="submit" id="release-btn">Release IP</button>
            </div>
            
            <div id="basic-buttons">
                <button class="btn-modern-blue" type="submit" id="save-btn">Save</button>
                <button class="btn-modern-red"  type="submit" id="close-btn">Close</button>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", pcMenuButtonsHandler);   
    $menu.querySelector("#dhcp-toggle").addEventListener("change", dhcpToggleHandler);
    $menu.querySelector("#web-server-toggle").addEventListener("change", webServerHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "pc-form"));
    $menu.querySelector("#iface").addEventListener("change", loadDhcpMenuConf);

    return $menu;

}

function showPcMenu(networkObjectId) {

    if (quickPingToggle) {
        quickPing(networkObjectId);
        return;
    }

    const $networkObject = document.getElementById(networkObjectId);
    const iface = getInterfaces(networkObjectId)[0];
    const $menu = document.querySelector(".pc-form");
    $menu.dataset.id = networkObjectId;
    const $textInputs = $menu.querySelectorAll("input[type='text']");
    const $buttonSection = $menu.querySelector(".button-container");
    const activeServices = getAvailableServices(networkObjectId);
    
  //Load the available interfaces

    loadInterfaces("pc-form");

  //Basic network configuration

    $menu.querySelector(".frame-title").innerHTML = networkObjectId;
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${iface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${iface}`);
    $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
    $menu.querySelector("#dns-server").value = (getDnsServers(networkObjectId) ?? "").join(",");

    //Check active services

    if (activeServices.includes("dhclient")) loadDhcpMenuConf();

    if (activeServices.includes("apache2")) {
        $menu.querySelector("#web-server-mode").classList.remove("hidden");
        if ($networkObject.getAttribute("apache2") === "true") $menu.querySelector("#web-server-toggle").checked = true;
    }

    //Display menu
    $menu.classList.remove("hidden");
}

async function pcMenuButtonsHandler(event) {

    event.preventDefault();

    const buttonId = event.submitter.id;
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $modules = $menu.querySelector(".modes-wrapper").querySelectorAll(".form-item");
    const $buttons = $menu.querySelector(".button-container").querySelectorAll("button");
    const $basicButtons = $menu.querySelectorAll(".button-container #basic-buttons button");
    const $ifaceSelector = $menu.querySelector("#iface");
    const networkInterface = $ifaceSelector.value;
    const newIp = $menu.querySelector("#ip").value;
    const newNetmask = $menu.querySelector("#netmask").value;
    const newGateway = $menu.querySelector("#gateway").value;
    const newDnsServers = ($menu.querySelector("#dns-server").value).split(",").map(ip => ip.trim()).filter(ip => ip !== "");
    const isEmptyForm = newIp === "" && newNetmask === "" && newGateway === "" && newDnsServers.length === 0;

    //menu functions

    const validateForm = () => {
        if (!isValidIp(newIp)) throw new Error(`Error: The IP address "${newIp}" is invalid.`);
        if (!isValidIp(newNetmask)) throw new Error(`Error: The subnet mask "${newNetmask}" is invalid.`);
        if (newGateway !== "" && !isValidIp(newGateway)) throw new Error(`Error: The defaulty gateway "${newGateway}" is invalid.`);
        if (newDnsServers.length !== 0 && !newDnsServers.every(isValidIp)) throw new Error(`Error: Invalid DNS servers.`);
    }

    const updatePcFormFields = () => {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
        $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
        $menu.querySelector("#dns-server").value = (getDnsServers($networkObject.id) ?? "").join(",");
    }

    const restorePcForm = () => {
        const $textInputs = $menu.querySelectorAll("input[type='text']");
        const $checkBoxes = $menu.querySelectorAll("input[type='checkbox']");
        $ifaceSelector.innerHTML = "";
        $modules.forEach($module => $module.classList.add("hidden"));
        $buttons.forEach(button => button.classList.add("hidden"));
        $basicButtons.forEach(button => button.classList.remove("hidden"));
        $checkBoxes.forEach(input => input.checked = false);
        $textInputs.forEach(input => input.disabled = false); 
        $menu.classList.add("hidden");
    }

    const buttonFunctions = {

        "save-btn": () => {
            if (!isEmptyForm) validateForm();
            configureInterface($networkObject.id, newIp, newNetmask, networkInterface);
            setDefaultGateway($networkObject.id, newGateway);
            setDnsServers($networkObject.id, newDnsServers);
            bodyComponent.render(popupMessage("Changes have been applied successfully."));
        },

        "get-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpDiscoverHandler($networkObject.id, networkInterface);
        },

        "renew-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpRenewHandler($networkObject.id, "T1", networkInterface);
        },

        "release-btn": async () => {
            if (visualToggle) restorePcForm();
            await dhcpReleaseHandler($networkObject.id, networkInterface);
        }

    }
    
//execute the corresponding function

    try {
        if (buttonId in buttonFunctions) await buttonFunctions[buttonId]();
    }catch(error) {
        console.log(error);
        bodyComponent.render(popupMessage(error.message));
        return;
    }

    if (buttonId === "close-btn") {
        restorePcForm();
        return;
    }

    updatePcFormFields();
    loadDhcpMenuConf();

}

function dhcpToggleHandler() {
    const $menu = document.querySelector(".pc-form");
    const iface = $menu.querySelector("#iface").value;
    const $networkObject = document.getElementById($menu.dataset.id);
    const isDhcpOn = ($menu.querySelector("#dhcp-toggle").checked) ? "true" : "false";
    $networkObject.setAttribute(`data-dhclient-${iface}`, isDhcpOn);
    loadDhcpMenuConf();
}

function webServerHandler(event) {

    const $webServerToggle = event.target;
    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $networkObjectIcon = $networkObject.querySelector("img");

    if (!$webServerToggle.checked) {
        $networkObject.setAttribute("apache2", false);
        $networkObjectIcon.src = "./assets/board/pc.svg";
    } else {
        $networkObject.setAttribute("apache2", true);
        $networkObjectIcon.src = "./assets/board/www-server.svg";
    }

}

function loadDhcpMenuConf() {

    const $menu = document.querySelector(".pc-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $dhcpButtons = $menu.querySelector("#dhcp-buttons");
    const $dhcpToggle = $menu.querySelector("#dhcp-toggle");
    const $inputFields = $menu.querySelectorAll("input[type='text']");
    const iface = $menu.querySelector("#iface").value;

   // Display DHCP mode

    $menu.querySelector("#dhcp-mode").classList.remove("hidden");
    
    //The DHCP client is not enabled for this interface

    if ($networkObject.getAttribute(`data-dhclient-${iface}`) !== "true") {
        $dhcpButtons.classList.add("hidden");
        $inputFields.forEach(input => input.disabled = false);
        $dhcpToggle.checked = false;
        return;
    }

    //display buttons

    $dhcpToggle.checked = true;
    $dhcpButtons.classList.remove("hidden");
    $inputFields.forEach(input => input.disabled = true);

    //if an IP address is assigned, the renewal and release buttons are displayed

    if ($networkObject.getAttribute(`ip-${iface}`) !== "") {
        $dhcpButtons.querySelector("#renew-btn").classList.remove("hidden");
        $dhcpButtons.querySelector("#release-btn").classList.remove("hidden");
        $dhcpButtons.querySelector("#get-btn").classList.add("hidden");
        return;
    }

// if no IP address is assigned, the obtain buttons are displayed

    $dhcpButtons.querySelector("#get-btn").classList.remove("hidden");
    $dhcpButtons.querySelector("#renew-btn").classList.add("hidden");
    $dhcpButtons.querySelector("#release-btn").classList.add("hidden");

}

/** translated into English by itsmeRiF **/

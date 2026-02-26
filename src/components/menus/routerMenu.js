function router_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("router-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p></div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Basic</button>
            <button class="btn-modern-blue dark" id="btn-routing-rules" data-tab="routing-rules-section">Routing Rules</button>
        </div>

        <section id="basic-section">

            <div class="interfaces-wrapper">
                <select id="iface"></select>
                <button class="btn-modern-red" id="del-iface">Delete</button>
                <button class="btn-modern-blue dark" id="add-iface">Add</button>
            </div>

            <div class="form-item">
                <label for="router-ip">IP Address (ipv4):</label>
                <input type="text" id="router-ip" name="router-ip">
            </div>

            <div class="form-item"> 
                <label for="router-netmask">Subnet mask:</label>
                <input type="text" name="router-netmask" id="router-netmask">
            </div>
            
            <div class="form-item">
                <button class="btn-modern-blue dark" style="padding: 10px;">Save</button>
                <button class="btn-modern-red dark" style="padding: 10px;" id="close-btn">Close</button>
            </div>

        </section>

        <section id="routing-rules-section" class="hidden">

            <div class="form-item">
                <label for="destination-ip">Destination IP (Ipv4/CIDR):</label>
                <input type="text" id="destination-ip" name="destination-ip" placeholder="192.168.0.0/24">
            </div>

            <div class="form-item">
                <label for="gateway-interface">Outgoing Interface:</label>
                <input type="text" id="gateway-interface" name="gateway-interface" placeholder="enp0s3">
            </div>

            <div class="form-item">
                <label for="nexthop">Next Hop:</label>
                <input type="text" id="nexthop" name="nexthop" placeholder="0.0.0.0">
            </div>

            <div class="form-item">
                <button class="btn-modern-blue dark" style="padding: 10px;" id="btn-add-rule">Add Rule</button>
                <button class="btn-modern-red dark" style="padding: 10px;" id="btn-del-rule">Delete Rule</button>
            </div>

            <div class="table-wrapper"><table id="routing-rules-table" class="inner-table"></table></div>

        </section>

    `;

    $menu.addEventListener("submit", saveRouterMenu);
    $menu.querySelector("#iface").addEventListener("change", selectGraphicInterface);
    $menu.querySelectorAll("input").forEach(input => input.addEventListener("change", registerNetworkChanges));
    $menu.querySelector("#del-iface").addEventListener("click", deleteGraphicInterface);
    $menu.querySelector("#add-iface").addEventListener("click", addGraphicInterface);
    $menu.querySelector(".nav-panel").querySelectorAll("button").forEach(button => button.addEventListener("click", showRouterGraphicTab));
    $menu.querySelector("#btn-add-rule").addEventListener("click", addRoutingRuleGraphicHandler);
    $menu.querySelector("#btn-del-rule").addEventListener("click", removeRoutingRuleGraphicHandler);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeRouterMenu);

    return $menu;

}

function showRouterMenu(event) {

    event.stopPropagation();

    const $networkObject = event.target.closest(".item-dropped");

    if (quickPingToggle) {
        quickPing($networkObject.id);
        return;
    }

    //We add the device identifier to the menu
    const $menu = document.querySelector(".router-form");
    $menu.dataset.id = $networkObject.id;
    $menu.querySelector(".frame-title").innerHTML = $networkObject.id;

    //We load the available interfaces
    
    const availableInterfaces = getInterfaces($networkObject.id);

    loadInterfaces("router-form");

    availableInterfaces.forEach(iface => {
        
        routerChangesBuffer[iface] = { 
            ip: $networkObject.getAttribute("ip-" + iface),
            netmask: $networkObject.getAttribute("netmask-" + iface)
        };

    });

    //load the information for the first interface

    $menu.querySelector("#router-ip").value = routerChangesBuffer[availableInterfaces[0]].ip;
    $menu.querySelector("#router-netmask").value = routerChangesBuffer[availableInterfaces[0]].netmask;

    //load the routing rules
    $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;

    //display the menu
    $networkObject.querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";
}

function saveRouterMenu(event) {

    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);

    for (let networkObjectInterface in routerChangesBuffer){

        const ip = routerChangesBuffer[networkObjectInterface].ip;
        const netmask = routerChangesBuffer[networkObjectInterface].netmask;

        if (ip !== "" && !isValidIp(ip)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>The IP "${ip}" is invalid.`));
            return;
        }

        if (netmask !== "" && !isValidIp(netmask)) {
            bodyComponent.render(popupMessage(`<span>Error: </span>The subnet mask "${netmask}" is invalid.`));
            return;
        }

        if (ip === "") deconfigureInterface($networkObject.id, networkObjectInterface);
        else configureInterface($networkObject.id, ip, netmask, networkObjectInterface);

    }
    
    $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    bodyComponent.render(popupMessage(`Changes have been saved successfully.`));

}

function closeRouterMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $form = document.querySelector(".router-form");
    $form.querySelector("#iface").innerHTML = "";
    routerChangesBuffer = {};
    $form.style.display = "none";
}

function selectGraphicInterface(event)  {
    const $select = event.target;
    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const ip = routerChangesBuffer[$select.value].ip;
    const netmask = routerChangesBuffer[$select.value].netmask;
    $menu.querySelector("#router-ip").value = ip;
    $menu.querySelector("#router-netmask").value = netmask;
}

function registerNetworkChanges()  {
    const $form = document.querySelector(".router-form");
    const iface = $form.querySelector("#iface").value;
    const ip = $form.querySelector("#router-ip").value;
    const netmask = $form.querySelector("#router-netmask").value;
    routerChangesBuffer[iface] = { ip: ip, netmask: netmask };
}

function addGraphicInterface(event) {

    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const $interfacesContainer = $menu.querySelector("#iface");
    
    // We add the interface
    addInterface($networkObject.id);
    const index = maxIfaceIndex($networkObject.id);
    
    // We add the option for the new interface
    $interfacesContainer.innerHTML += `<option value="enp0s${index}">enp0s${index}</option>`;
    
    // We add a new reference to the interface
    routerChangesBuffer[`enp0s${index}`] = { ip: "",netmask: "" };

    bodyComponent.render(popupMessage(`Interface enp0s${index} added successfully.`));
  
}

function deleteGraphicInterface(event) {

    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const $networkObject = document.getElementById($menu.dataset.id);
    const currentInterface = $menu.querySelector("#iface").value;
    const fixedInterfaces = ["enp0s3"];

    if (fixedInterfaces.includes(currentInterface)) {
        bodyComponent.render(popupMessage(`<span>Error: The interface ${currentInterface} cannot be deleted.`));
        return;
    }

    if ($networkObject.getAttribute("data-switch-" + currentInterface) !== "") {
        bodyComponent.render(popupMessage(`<span>Error: </span>The interface ${currentInterface} has an active connection.`));
        return;
    }

    deleteInterface($networkObject.id, currentInterface);
   
    $menu.querySelector("#iface").querySelectorAll("option").forEach($option => {
        if ($option.value === currentInterface) $option.remove();
    });

    delete routerChangesBuffer[currentInterface];

    bodyComponent.render(popupMessage(`Interface ${currentInterface} removed successfully.`));
}

function showRouterGraphicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".router-form");
    const $targetButton = event.target;
    const $sections = $menu.querySelectorAll("section");
    const $navButtons = $menu.querySelector(".nav-panel").querySelectorAll("button");
    const $targetSection = $menu.querySelector(`#${$targetButton.getAttribute("data-tab")}`);
    $navButtons.forEach($button => $button.classList.remove("active"));
    $targetButton.classList.add("active");
    $sections.forEach($section => $section.classList.add("hidden"));
    $targetSection.classList.remove("hidden");
}

function addRoutingRuleGraphicHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const networkObjectId = $menu.dataset.id;
    const $networkObject = document.getElementById(networkObjectId);
    const $routingSection = $menu.querySelector("#routing-rules-section");

    //<-- obtengo los parametros de la regla
    
    const destination = $routingSection.querySelector("#destination-ip").value;
    const gatewayInterface = $routingSection.querySelector("#gateway-interface").value;
    const nexthop = $routingSection.querySelector("#nexthop").value;

    //<-- I try to add the rule

    try {
        addRoutingRuleGraphic(networkObjectId, destination, gatewayInterface, nexthop);
        $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

function removeRoutingRuleGraphicHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".router-form");
    const networkObjectId = $menu.dataset.id;
    const $networkObject = document.getElementById(networkObjectId);
    const $routingSection = $menu.querySelector("#routing-rules-section");

    //<-- I get the rule parameters
    
    const destination = $routingSection.querySelector("#destination-ip").value;

    //<-- I try to delete the rule

    try {
        removeRoutingRuleGraphic(networkObjectId, destination);
        $menu.querySelector("#routing-rules-table").innerHTML = $networkObject.querySelector(".routing-table").querySelector("table").innerHTML;
    }catch (error) {
        bodyComponent.render(popupMessage(error.message));
    }

}

function addRoutingRuleGraphic(networkObjectId, destination, gatewayInterface, nexthop) {

    //<-- We validate the destination IP address
	
    if (!isValidCidrIp(destination)) throw new Error(`Error: A valid prefix was expected instead of "${destination}".`);
    const [destinationIP, destinationNetmask] = parseCidr(destination);
    if (getNetwork(destinationIP, destinationNetmask) !== destinationIP) throw new Error(`Error: The destination IP address "${destination}" is NOT a network.`);
    
    //<-- We validate the outgoing interface
    
    if (!(getInterfaces(networkObjectId)).includes(gatewayInterface)) throw new Error(`Error: The interface "${gatewayInterface}" is not recognized.`);
    const [gatewayIp, gatewayNetmask, interfaceMac] = getIfaceData(networkObjectId, gatewayInterface);
    if (!gatewayIp) throw new Error(`Error: The interface "${gatewayInterface}" is not configured.`);

    //<-- Validate the next hop

    if (!isValidIp(nexthop)) throw new Error(`Error: A valid IP address was expected instead of "${nexthop}" at the next hop.`);
    if (getNetwork(gatewayIp, gatewayNetmask) !== getNetwork(nexthop, gatewayNetmask)) throw new Error(`Error: The next hop "${nexthop}" is unreachable.`);
    if (nexthop === "0.0.0.0") throw new Error(`Error: The next hop "${nexthop}" is not valid for a remote rule.`);

    setRemoteRoutingRule(networkObjectId,
        destinationIP, //Destination IP address
        destinationNetmask, //Subnet Mask
        gatewayIp, //Gateway IP
        gatewayInterface, //interface
        nexthop //Next hop
    );

}

function removeRoutingRuleGraphic(networkObjectId, destination) {

    //<-- We validate the destination IP address

    if (!isValidCidrIp(destination)) throw new Error(`Error: A valid prefix was expected instead of "${destination}".`);
    const [destinationIP, destinationNetmask] = parseCidr(destination);
    if (getNetwork(destinationIP, destinationNetmask) !== destinationIP) throw new Error(`Error: The destination IP address "${destination}" is NOT a network.`);

    removeRemoteRoutingRule(networkObjectId,
        destinationIP, //Destination IP
        destinationNetmask //Subnet mask
    );

}


/** translated by itsmeRiF **/

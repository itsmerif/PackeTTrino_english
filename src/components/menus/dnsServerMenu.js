function dns_server_menu() {

    const $menu = document.createElement("form");
    $menu.classList.add("dns-form", "modal", "draggable-modal");
    $menu.setAttribute("data-id", "");

    $menu.innerHTML = `

        <div class="window-frame"> <p class="frame-title"></p> </div>

        <div class="nav-panel">
            <button class="btn-modern-blue dark active" id="btn-basic-tab" data-tab="basic-section">Basic</button>
            <button class="btn-modern-blue dark" id="btn-records" data-tab="records-section">Records</button>
        </div>

        <section id="basic-section">
            
            <section id="network-section" class="hidden">

                <div class="form-item">
                    <label for="iface">Interface:</label>
                    <select id="iface" name="iface"></select>
                </div>

                <div class="form-item">
                    <label for="ip">IP Address (IPv4):</label>
                    <input type="text" id="ip" name="ip">
                </div>

                <div class="form-item">
                    <label for="netmask">Subnet Mask:</label>
                    <input type="text" id="netmask" name="netmask">
                </div>

                <div class="form-item">
                    <label for="gateway">Default Gateway:</label>
                    <input type="text" id="gateway" name="gateway">
                </div>

            </section>

            <section id ="dns-server-section">

                <div class="form-item">
                    <label for="dns-recursive">Recursive DNS Server:</label>
                    <input class="btn-toggle" type="checkbox" id="dns-recursive" name="dns-recursive">
                </div>

                <div class="form-item">
                    <label for="dns-cache">Cache DNS Server:</label>
                    <input class="btn-toggle" type="checkbox" id="dns-cache" name="dns-cache">
                </div>

            </section>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" type="submit">Save</button>
                <button class="btn-modern-red dark" id="close-btn">Close</button>
            </div>

        </section>

        <section id="records-section" class="hidden">

            <div class="form-item">
                <label for="domain">Domain:</label>
                <input type="text" id="domain" name="domain">
            </div>

            <div class="form-item">
                <label for="type">Record Type:</label>
                <select id="type" name="type">
                    <option value="A">A</option>
                    <option value="CNAME">CNAME</option>
                    <option value="NS">NS</option>
                    <option value="SOA">SOA</option>
                </select>
            </div>

            <div class="form-item">
                <label for="value">Value:</label>
                <input type="text" id="value" name="value">
            </div>

            <div class="soa-record-wrapper hidden">

                <div class="form-item">
                    <label for="serial">Serial Number:</label>
                    <input type="text" id="serial" name="serial">
                </div> 

                <div class="form-item">
                    <label for="cache-ttl">Cache TTL:</label>
                    <input type="text" id="cache-ttl" name="cache-ttl">
                </div>

            </div>

            <div class="button-wrapper">
                <button class="btn-modern-blue dark" id="btn-add-record" style="padding: 5px;">Add Record</button>
                <button class="btn-modern-red dark" id="btn-del-record" style="padding: 5px;">Delete Record</button>
            </div>
            
            <div class="table-wrapper">
                <table id="records-table" class="inner-table"></table>
            </div>

        </section>

    `;

    $menu.addEventListener("submit", saveDnsServerMenu);
    $menu.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    $menu.querySelector("#close-btn").addEventListener("click", closeDnsMenu);
    $menu.querySelector(".nav-panel").querySelectorAll("button").forEach(button => button.addEventListener("click", showDnsGraphicTab));
    $menu.querySelector("#btn-add-record").addEventListener("click", addDnsRecordHandler);
    $menu.querySelector("#btn-del-record").addEventListener("click", removeDnsRecordHandler);
    $menu.querySelector("#type").addEventListener("change", recordTypeHandler);
    $menu.querySelector("#iface").addEventListener("change", (event) => interfaceHandler(event, "dns-form"));
    
    return $menu;

}

function showDnsServerMenu(event) {

    event.stopPropagation();
    
    const $networkObject = event.target.closest(".item-dropped");

    if (quickPingToggle) { //<-- We check if we are in icmptryout mode
        quickPing($networkObject.id);
        return;
    }

    const networkObjectInterface = getInterfaces($networkObject.id)[0];
    const $menu = document.querySelector(".dns-form");
    $menu.dataset.id = $networkObject.id;
    const isDnsServer = $networkObject.id.startsWith("dns-server-");
    const isRecursive = $networkObject.getAttribute("recursion");
    const isCache = $networkObject.getAttribute("resolved");
    
//Load the available interfaces

    loadInterfaces("dns-form");
    
    //device attributes
    if (isDnsServer) {
        $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkObjectInterface}`);
        $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkObjectInterface}`);
        $menu.querySelector("#gateway").value = getDefaultGateway($networkObject.id);
        $menu.querySelector("#network-section").classList.remove("hidden");
    }

    //service attributes
    $menu.querySelector("#dns-recursive").checked = isRecursive === "true";
    $menu.querySelector("#dns-cache").checked = isCache === "true";
    $menu.querySelector("#records-table").innerHTML = $networkObject.querySelector(".dns-table").querySelector("table").innerHTML;
    $menu.querySelector(".frame-title").innerHTML = $networkObject.id;

    //Display the menu
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    $menu.style.display = "flex";
}

function saveDnsServerMenu(event) {

    event.preventDefault();
    event.stopPropagation();

    const $menu = document.querySelector(".dns-form");
    const $serverObject = document.getElementById($menu.dataset.id);
    const networkObjectInterface = $menu.querySelector("#iface").value;
    const ip = $menu.querySelector("#ip").value;
    const netmask = $menu.querySelector("#netmask").value;
    const gateway = $menu.querySelector("#gateway").value;
    const isDnsServer = $serverObject.id.startsWith("dns-server");
    const isRecursive = $menu.querySelector("#dns-recursive").checked;
    const isCache = $menu.querySelector("#dns-cache").checked;
    const isEmptyForm = ip === "" && netmask === "";

    try {

        if (isDnsServer) {

            if (!isEmptyForm) {
                if (!isValidIp(ip)) throw new Error(`Error: The IP "${ip}" is not valid.`);
                if (!isValidIp(netmask)) throw new Error(`Error: The netmask "${netmask}" is invalid.`);
            }

            if (gateway !== "" && !isValidIp(gateway)) throw new Error(`Error: The gateway "${gateway}" is invalid.`);

            configureInterface($serverObject.id, ip, netmask, networkObjectInterface);
            setDefaultGateway($serverObject.id, gateway);

        }

        $serverObject.setAttribute("recursion", isRecursive);
        $serverObject.setAttribute("resolved", isCache);

        bodyComponent.render(popupMessage(`Changes were saved successfully.`));

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));
        return;

    }

}

function closeDnsMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    $menu.querySelector("#network-section").classList.add("hidden");
    $menu.querySelector(".soa-record-wrapper").classList.add("hidden");
    $menu.reset();
    $menu.style.display = "none";
}

function showDnsGraphicTab(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const $targetButton = event.target;
    const $sections = $menu.querySelectorAll(":scope > section");
    const $navButtons = $menu.querySelector(".nav-panel").querySelectorAll("button");
    const $targetSection = $menu.querySelector(`#${$targetButton.getAttribute("data-tab")}`);
    $navButtons.forEach($button => $button.classList.remove("active"));
    $targetButton.classList.add("active");
    $sections.forEach($section => $section.classList.add("hidden"));
    $targetSection.classList.remove("hidden");
}

function addDnsRecordHandler(event) {

    event.stopPropagation();
    event.preventDefault();

    const $menu = document.querySelector(".dns-form");
    const serverObjectId = $menu.dataset.id;
    const $serverObject = document.getElementById(serverObjectId);   
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    const value = $menu.querySelector("#value").value;
    const serial = $menu.querySelector("#serial").value;
    const cacheTTL = $menu.querySelector("#cache-ttl").value;

    const dnsRecordTypes = { //<-- Mapping record types to validation functions
        "SOA": () => isValidSOARecord(serverObjectId, domain, value, serial, cacheTTL),
        "NS": () => isValidNSRecord(serverObjectId, domain, value),
        "A": () => isValidARecord(serverObjectId, domain, value),
        "CNAME": () => isValidCNAMERecord(serverObjectId, domain, value)
    }

    try {

        dnsRecordTypes[recordType.toUpperCase()](); //<-- Validate the record
        
        let record = new dnsRecord(domain, recordType, value);

        if (recordType === "SOA") {
            record.serial = serial; 
            record.cacheTTL = cacheTTL;
        }

        addDnsEntry(serverObjectId, record);

        $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;

    } catch (error) {

        bodyComponent.render(popupMessage(error.message));

    }

}

function removeDnsRecordHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    const $menu = document.querySelector(".dns-form");
    const serverObjectId = $menu.dataset.id;
    const $serverObject = document.getElementById(serverObjectId);
    const domain = $menu.querySelector("#domain").value;
    const recordType = $menu.querySelector("#type").value;
    delDnsEntry(serverObjectId, recordType, domain);
    $menu.querySelector("#records-table").innerHTML = $serverObject.querySelector(".dns-table").querySelector("table").innerHTML;
}

function recordTypeHandler(event) {
    const $menu = document.querySelector(".dns-form");
    const $recordType = $menu.querySelector("#type");
    const $serial = $menu.querySelector("#serial");
    const $soaRecordWrapper = $menu.querySelector(".soa-record-wrapper");
    $serial.value = (new Date()).getTime(); //Generate a serial number
    if ($recordType.value === "SOA") $soaRecordWrapper.classList.remove("hidden");
    else $soaRecordWrapper.classList.add("hidden");
}

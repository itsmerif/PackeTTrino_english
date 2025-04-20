//setters

function setDirectRoutingRule(routerObjectId, gateway, netmask, interface) {

    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    let found = false;

    $rules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[3].innerHTML === interface && $fields[4].innerHTML === "0.0.0.0") {
            $fields[0].innerHTML = getNetwork(gateway, netmask);
            $fields[1].innerHTML = netmask;
            $fields[2].innerHTML = gateway;
            found = true;
        }
    });

    if (!found) {

        const $defaultRule = $routingTable.querySelector("#default-route");
        let $newRow = document.createElement("tr");
        $newRow.innerHTML = `
            <tr>
                <td>${getNetwork(gateway, netmask)}</td>
                <td>${netmask}</td>
                <td>${gateway}</td>
                <td>${interface}</td>
                <td>0.0.0.0</td>
            </tr>`;
    
        $defaultRule.before($newRow);

    }

}

function setRemoteRoutingRule(routerObjectId, destination, netmask, gateway, interface, nexthop) {

    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    let found = false;

    $rules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[0].innerHTML === destination && $fields[1].innerHTML === netmask) {
            found = true;
            $fields[2].innerHTML = gateway;
            $fields[3].innerHTML = interface;
            $fields[4].innerHTML = nexthop;
        }    
    });

    if (!found) {

        const $defaultRule = $routingTable.querySelector("#default-route");

        let $newRow = document.createElement("tr");

        $newRow.innerHTML = `
            <tr>
                <td>${destination}</td>
                <td>${netmask}</td>
                <td>${gateway}</td>
                <td>${interface}</td>
                <td>${nexthop}</td>
            </tr>
        `;

        $defaultRule.before($newRow);

    }

}

function setDefaultRoutingRule(routerObjectId, gateway, interface, nexthop) {

    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $defaultRule = $routingTable.querySelector("#default-route");
    const $fields = $defaultRule.querySelectorAll("td");

    $fields[0].innerHTML = "0.0.0.0";
    $fields[1].innerHTML = "0.0.0.0";
    $fields[2].innerHTML = gateway
    $fields[3].innerHTML = interface;
    $fields[4].innerHTML = nexthop;

}

//removers

function removeDirectRoutingRule(routerObjectId, interface) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    $rules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[3].innerHTML === interface && $fields[4].innerHTML === "0.0.0.0") $rule.remove();
    });
}

function removeRemoteRoutingRule(routerObjectId, destination, netmask) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");
    $rules.forEach($rule => {
        const $fields = $rule.querySelectorAll("td");
        if ($fields.length === 0) return;
        if ($fields[0].innerHTML === destination && $fields[1].innerHTML === netmask) $rule.remove();
    });
}

function resetDefaultRoutingRule(routerObjectId) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $defaultRule = $routingTable.querySelector("#default-route");
    const $fields = $defaultRule.querySelectorAll("td");   
    $fields[0].innerHTML = "0.0.0.0";
    $fields[1].innerHTML = "0.0.0.0";
    $fields[2].innerHTML = "";
    $fields[3].innerHTML = "";
    $fields[4].innerHTML = "";
}

//mas funciones

function printRoutingTable(networkObjectId) {

    const $networkObject = document.getElementById(networkObjectId);

    if (!networkObjectId.includes("router-")) {
        const ip = $networkObject.getAttribute("ip-enp0s3");
        const netmask = $networkObject.getAttribute("netmask-enp0s3");
        const network = getNetwork(ip, netmask);
        const gateway = $networkObject.getAttribute("data-gateway");
        terminalMessage(`${network}/${netmaskToCidr(netmask)} via ${ip} dev enp0s3`, networkObjectId);
        terminalMessage(`default via ${gateway || "-"} dev enp0s3`, networkObjectId);
        return;
    }

    const table = $networkObject.querySelector(".routing-table").querySelector("table");
    const rows = table.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {

        let row = rows[i];
        let cells = row.querySelectorAll("td");
        let destination = cells[0].innerHTML;
        let netmask = cells[1].innerHTML;
        let gateway = cells[2].innerHTML;
        let interface = cells[3].innerHTML;
        let formattedRoute = "";

        if (destination.trim() === "0.0.0.0" && netmask.trim() === "0.0.0.0") {
            formattedRoute = `default via ${gateway || "-"} dev ${interface || "-"}`;
        } else if (destination !== "") {
            formattedRoute = `${destination}/${netmaskToCidr(netmask)} via ${gateway} dev ${interface}`;
        }

        terminalMessage(formattedRoute, networkObjectId);
    }
}

function routingTableRestore(routerObjectid) {

    const $routerObject = document.getElementById(routerObjectid);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");

    routingTable.innerHTML = `
                <tr>
                    <th>Destination</th>
                    <th>Netmask</th>
                    <th>Gateway</th>
                    <th>Interface</th>
                    <th>Next Hop</th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0 </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td> 0.0.0.0 </td>
                </tr>
                <tr>
                    <td> 0.0.0.0 </td>
                    <td> 0.0.0.0 </td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>`;

}

function getRoutingRule(routerObjectId, destination, netmask) {
    const $networkObject = document.getElementById(routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");
    let response = false;

    for (let i = 1; i < $rows.length; i++) {
        let $row = $rows[i];
        let cells = $row.querySelectorAll("td");
        if (cells.length > 0 && cells[0].innerHTML === destination && cells[1].innerHTML === netmask) response = $row;
    }

    return response;
}

function fromRouterInterface(routerObjectId, interface, attribute) {

    const $routerObject = document.getElementById(routerObjectId);
    const routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");
    let response = "";

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let cells = row.querySelectorAll("td");
        if (cells[3].innerHTML === interface) {
            if (attribute === "destination") response = cells[0].innerHTML;
            if (attribute === "netmask") response = cells[1].innerHTML;
            if (attribute === "gateway") response = cells[2].innerHTML;
            if (attribute === "nexthop") response = cells[4].innerHTML;
        }
    }

    return response;
}

function removeRemoteRules($routerObjectId) {

    const $networkObject = document.getElementById($routerObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $rules = $routingTable.querySelectorAll("tr");

    $rules.forEach($rule => {
        const $cells = $rule.querySelectorAll("td");
        if ($cells.length > 1 && $cells[4].innerHTML !== "0.0.0.0" && $cells[0].innerHTML !== "0.0.0.0" ) $rule.remove();
    });

    const $defaultRow = $routingTable.querySelector("#default-route");
    let cells = $defaultRow.querySelectorAll("td");
    cells[0].innerHTML = "0.0.0.0";
    cells[1].innerHTML = "0.0.0.0";
    cells[2].innerHTML = "";
    cells[3].innerHTML = "";
    cells[4].innerHTML = "";

}

function getRoutingRules(routerObjectid, targetinterface) {

    const $routerObject = document.getElementById(routerObjectid);
    const $routingTable = $routerObject.querySelector(".routing-table").querySelector("table");
    const $rows = $routingTable.querySelectorAll("tr");
    const rules = [];

    for (let i = 4; i < $rows.length; i++) {
        let $row = $rows[i];
        let $cells = $row.querySelectorAll("td");
        let destination = $cells[0].innerHTML.trim();
        let netmask = $cells[1].innerHTML.trim();
        let interface = $cells[3].innerHTML.trim();
        let nextHop = $cells[4].innerHTML.trim();
        if (interface === targetinterface && nextHop !== "0.0.0.0") rules.push(`ip route add ${destination}/${netmaskToCidr(netmask)} via ${nextHop}`);
    }

    return rules;
}

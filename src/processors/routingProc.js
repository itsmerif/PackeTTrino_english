async function routing(networkObjectId, packet, isHost = false) {

    const $networkObject = document.getElementById(networkObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") {

        if (isHost) {
            const iface = getInterfaces($networkObject.id)[0];
            const switchId = $networkObject.getAttribute(`data-switch-${iface}`);
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
        }

        return; // Los routers no enrutan tráfico broadcast
        
    }

    for (let i = 1; i < $routingRules.length; i++) {

        let $rule = $routingRules[i];
        let $fields = $rule.querySelectorAll("td");
        let ruleNetwork = $fields[0].innerHTML;
        let ruleNetmask = $fields[1].innerHTML;
        let ruleInterface = $fields[3].innerHTML;
        let rulenexthop = $fields[4].innerHTML;

        if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) {

            packet.origin_mac = $networkObject.getAttribute("mac-" + ruleInterface);
            packet.destination_mac = "";

            let nexthopMac;

            if (rulenexthop === "0.0.0.0") {
                nexthopMac = isIpInARPTable(networkObjectId, packet.destination_ip) || 
                await arpResolve(networkObjectId, packet.destination_ip, isHost ? undefined : ruleInterface);
            } else {
                nexthopMac = isIpInARPTable(networkObjectId, rulenexthop) || 
                await arpResolve(networkObjectId, rulenexthop, isHost ? undefined : ruleInterface);
            }

            if (!nexthopMac) return;
            
            packet.destination_mac = nexthopMac;

            if (isHost) { // Procesamiento específico para hosts
                
                if (!firewallProcessorFilter(networkObjectId, packet, "OUTPUT", "", ruleInterface)) {
                    if (visualToggle) igniteFire(networkObjectId);
                    return;
                }

                const nextSwitch = $networkObject.getAttribute("data-switch-" + ruleInterface);
                addPacketTraffic(packet);
                await switchProcessor(nextSwitch, networkObjectId, packet);

            } else { // Procesamiento específico para routers
                
                await firewallProc(networkObjectId, packet, ruleInterface);
            }

            return;

        }
    }
}
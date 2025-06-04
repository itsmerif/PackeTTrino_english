async function routing(networkObjectId, packet, isNotForward = false) {

    const $networkObject = document.getElementById(networkObjectId);
    const $routingTable = $networkObject.querySelector(".routing-table").querySelector("table");
    const $routingRules = $routingTable.querySelectorAll("tr");

    if (packet.destination_ip === "255.255.255.255" || packet.destination_mac === "ff:ff:ff:ff:ff:ff") {

        if (isNotForward) {
            const iface = getInterfaces($networkObject.id)[0];
            const switchId = $networkObject.getAttribute(`data-switch-${iface}`);
            addPacketTraffic(packet);
            await switchProcessor(switchId, networkObjectId, packet);
        }

        return; // Los routers no enrutan tráfico broadcast
        
    }

    for (let i = 1; i < $routingRules.length; i++) {

        const $rule = $routingRules[i];
        const $fields = $rule.querySelectorAll("td");
        const ruleNetwork = $fields[0].innerHTML;
        const ruleNetmask = $fields[1].innerHTML;
        const ruleInterface = $fields[3].innerHTML;
        const rulenexthop = $fields[4].innerHTML;

        if (ruleNetwork === getNetwork(packet.destination_ip, ruleNetmask)) {

            packet.origin_mac = $networkObject.getAttribute("mac-" + ruleInterface);
            packet.destination_mac = "";
                        
            const nextHop = (rulenexthop === "0.0.0.0") ? packet.destination_ip : rulenexthop;
            const nexthopMac = isIpInARPTable(networkObjectId, nextHop) || await arpResolve(networkObjectId, nextHop, ruleInterface);

            if (!nexthopMac) return;
            
            packet.destination_mac = nexthopMac;

            if (isNotForward) {
                
                if (!firewallProcessorFilter(networkObjectId, packet, "OUTPUT", "", ruleInterface)) {
                    if (visualToggle) igniteFire(networkObjectId);
                    return;
                }

                const nextSwitch = $networkObject.getAttribute("data-switch-" + ruleInterface);
                addPacketTraffic(packet);
                await switchProcessor(nextSwitch, networkObjectId, packet);

            } else {
                
            
                await firewallProc(networkObjectId, packet, ruleInterface);
                
            }

            return;

        }
    }
}
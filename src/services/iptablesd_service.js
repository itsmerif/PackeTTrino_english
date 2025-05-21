/**ESTA FUNCION COMPRUEBA SI UN PAQUETE SUPERA UN CORTAFUEGOS (TABLA FILTER) */
function firewallProcessorFilter(networkObjectId, packet, targetChain, inputInterface, outputInterface)  {

    const $networkObject = document.getElementById(networkObjectId);
    const defaultPolicies = JSON.parse($networkObject.getAttribute("firewall-default-policy"));
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    const firewallRulesFilter = firewallRules["FILTER"];
    let response = false;
    let found = false;

    const defaultPolicy = defaultPolicies[targetChain];

    firewallRulesFilter.forEach(rule => {

        if (rule.A !== targetChain) return;

        if (rule.p !== "*" && rule.p !== packet.transport_protocol && rule.p !== packet.protocol) return;

        if (rule.s !== "*" && rule.s !== packet.origin_ip) return;

        if (rule.d !== "*" && rule.d !== packet.destination_ip) return;

        if (inputInterface !== "" && rule.i !== "*" && rule.i !== inputInterface) return;

        if (outputInterface !== "" && rule.o !== "*" && rule.o !== outputInterface) return;

        if (rule.sport !== "*" && rule.sport !== packet.sport) return;

        if (rule.dport !== "*" && rule.dport !== packet.dport) return;

        found = true;

        if (rule.j === "ACCEPT") response = true;

        if (rule.j === "DROP") response = false;
    });

    if (!found) response = defaultPolicy === "ACCEPT";
    
    return response;

}

/**ESTA FUNCION REALIZA NAT DE UN PAQUETE SI ES NECESARIO */
function firewallProcessorNat(networkObjectId, packet, inputInterface, outputInterface, targetChain)  {

    const $networkObject = document.getElementById(networkObjectId);
    const firewallRules = JSON.parse($networkObject.getAttribute("firewall-rules"));
    const firewallRulesNat = firewallRules["NAT"];
    let natFilteredPacket = structuredClone(packet);
    let targetAction;

    if (targetChain === "PREROUTING") targetAction = "DNAT";
    if (targetChain === "POSTROUTING") targetAction = "SNAT";

    firewallRulesNat.forEach(rule => {

        if (rule.A !== targetChain) return;

        if (rule.j !== targetAction) return;

        if (rule.p !== "*" && rule.p !== packet.transport_protocol && rule.p !== packet.protocol) return;

        if (rule.s !== "*" && rule.s !== packet.origin_ip) return;

        if (rule.d !== "*" && rule.d !== packet.destination_ip) return;

        if (inputInterface !== "" && rule.i !== "*" && rule.i !== inputInterface) return;

        if (outputInterface !== "" && rule.o !== "*" && rule.o !== outputInterface) return;

        if (rule.sport !== "*" && rule.sport !== packet.sport) return;

        if (rule.dport !== "*" && rule.dport !== packet.dport) return;

        //cambiamos el destino u origen del paquete según sea necesario
        if (targetAction === "DNAT") natFilteredPacket.destination_ip = rule.to__destination;
        if (targetAction === "SNAT") natFilteredPacket.origin_ip = rule.to__source;

    });

    //si el paquete resultante es distinto al original, generamos y guardamos una conexion entre el origen y el destino

    if (packet.destination_ip !== natFilteredPacket.destination_ip || packet.origin_ip !== natFilteredPacket.origin_ip) {
        if (!connTrack[networkObjectId]) connTrack[networkObjectId] = {};
        connTrack[networkObjectId][packet.destination_ip] = packet.origin_ip;
    }
    
    return natFilteredPacket;

}
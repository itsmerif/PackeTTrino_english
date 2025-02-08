function ping(originIP, destinationIP) {

    // Compruebo que el equipo origen está configurado

    if (!originIP) {
        ping_f(originIP);
        return;
    }

    // si el origen y el destino es el mismo, es un loopback

    if (originIP === destinationIP) {
        ping_s(originIP);
        return;
    }

    const origin = document.querySelector(`[data-ip="${originIP}"]`);
    const originId = origin.id;
    const originNetmask = origin.getAttribute("data-netmask");
    const NetworkOriginObject = document.getElementById(originId);
    const switchIdentity = NetworkOriginObject.getAttribute("data-switch");
    const switchOriginObject = document.getElementById(switchIdentity);

    if (getNetwork(originIP, originNetmask) === getNetwork(destinationIP, originNetmask)) {     //si el destino y origen están en la misma red

        if (isIpInARPTable(originId, destinationIP)) { // si el equipo destino está en la tabla ARP del equipo origen

            const macEncontrada = isIpInARPTable(originId, destinationIP); // Hemos encontrado la mac del equipo destino

            //enviamos una trama unicast al switch con esa mac de destino

            if (isMacInMACTable(switchIdentity, macEncontrada)) { //la mac existe en la tabla del switch. el switch envia una trama unicast al destino.

                //por la estructura de nuestro codigo, la comprobacion interna en el destino de la MAC es innecesaria
                //ya que si la mac existe en la tabla del switch, entonces el destino debe estar CONECTADO a la tabla del switch

                //a nivel de red, debemos comprobar que la ip de destino es la del equipo

                if (ipCheck(macEncontrada, destinationIP)) {

                    ping_s(originIP);
                    return;

                } else {

                    ping_f(originIP);
                    return;

                }

            } else { //no existe la mac en la tabla del switch

                //de nuevo, por la estructura de nuestro codigo, si no existe la mac en la tabla del switch, entonces el destino NO ESTÁ CONECTADO a la tabla del switch,
                //y por tanto el ping debe fallar

                ping_f(originIP);
                return;

            }

        } else { //el destino no está en la tabla ARP del equipo origen

            //el pc envia una trama broadcast al swich, y esté a su vez reenvía la trama broadcast a cada equipo conectado
            //internamente, cada equipo comprueba si la IP destino coincide con la suya

            if (isIpInNetwork(switchOriginObject.id, destinationIP)) { //bingo, uno de los equipos acepta la trama y se da por exitoso

                const destinationMac = isIpInNetwork(switchOriginObject.id, destinationIP);
                addARPEntry(originId, destinationIP, destinationMac); //agregamos una nueva entrada a la tabla ARP del equipo origen
                ping_s(originIP);
                return;

            } else { //ninguno de los equipos acepta la trama y se da por fallido

                ping_f(originIP);
                return;

            }

        }

    }
}

function ping_s(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `64 bytes from ${origin}: icmp_seq=${seq} ttl=64 time=0.030 ms\n`;
        seq++;
    }, 1000);

}

function ping_f(origin) {

    const terminalOutput = document.querySelector(".terminal-output");
    let seq = 1;
    window.pingInterval = setInterval(() => {
        terminalOutput.innerHTML += `From ${origin} icmp_seq=${seq} Destination Host Unreachable\n`;
        seq++;
    }, 1000);

}
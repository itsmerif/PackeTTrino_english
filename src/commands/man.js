function command_man(topic) {

    switch (topic) {
        case "ping":
            terminalMessage("<p>ping: utilidad de diagnóstico de red para verificar la conectividad entre un dispositivo y otro </p>");
            terminalMessage("<p>Sintaxis: ping &lt;ip|domain&gt;</p>");
            terminalMessage("<p>Ejemplo: ping 8.8.8.8</p>");
            terminalMessage("<p>Ejemplo: ping google.com</p>");
            terminalMessage("<p><span style='color: red;'>Nota:</span> Si se introduce una ip no válida, se intentará resolver como nombre de dominio.</p>");
            break;
        case "dhcp":
            terminalMessage("<p>dhcp: utilidad de descubrimiento de servidor DHCP o de renovación de IP</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p><span style='color: green'>-renew </span>: renovar la IP si se tiene una asignada o descubrir un servidor DHCP</p>");
            terminalMessage("<p><span style='color: green'>-release </span>: liberar la IP si se tiene una asignada </p>");
            terminalMessage("<p><span style='color: red'>Nota </span>: El equipo debe estar configurado como DHCP para que esta utilidad funcione.</p>");
            break;
        case "firewall":
            terminalMessage("<p>firewall: utilidad para configurar el cortafuegos de un dispositivo</p>");
            terminalMessage("<p>Sintaxis: firewall &lt;add|del&gt; -A &lt;chain&gt; -p &lt;protocol&gt; --dport &lt;port&gt; -s &lt;origin&gt; -d &lt;destination&gt; -j &lt;action&gt;</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p> add: añadir una regla al cortafuegos</p>");
            terminalMessage("<p> del: eliminar una regla del cortafuegos</p>");
            terminalMessage("<p> -A &lt;chain&gt;: especificar la cadena del cortafuegos</p>");
            terminalMessage("<p> -p &lt;protocol&gt;: especificar el protocolo</p>");
            terminalMessage("<p> --dport &lt;port&gt;: especificar el puerto. Puede ser cualquiera (*) </p>");
            terminalMessage("<p> -s &lt;origin&gt;: especificar la ip origen. Puede ser cualquiera (*)</p>");
            terminalMessage("<p> -d &lt;destination&gt;: especificar la ip destino. Puede ser cualquiera (*)</p>");
            terminalMessage("<p> -j &lt;action&gt;: especificar la acción</p>");
            terminalMessage("<p>Ejemplo: firewall add -A INPUT -p tcp --dport 80 -s 192.168.1.100 -d 192.168.1.1 -j ACCEPT</p>");
            terminalMessage("<p><span style='color: red'>Nota</span>: Todas las opciones son obligatorias. Usar (*) significa cualquier valor.</p>");
            break;
        case "ip":
            terminalMessage("<p>ip: utilidad para mostrar/administrar la configuración de red o enrutamiento en un dispositivo</p>");
            terminalMessage("<p style='text-decoration: underline;'>Opciones de address:</p>");
            terminalMessage("<p>Sintaxis: ip addr [add|del] [ip] [netmask] dev [interface]</p>");
            terminalMessage("<p>addr: mostrar la información del equipo</p>");
            terminalMessage("<p>add: añadir una nueva red a un dispositivo</p>");
            terminalMessage("<p>del: eliminar una red de un dispositivo</p>");
            terminalMessage("<p>Ejemplo: ip addr add 192.168.1.100 255.255.255.0 dev enp0s3</p>");
            terminalMessage("<p style='text-decoration: underline;'>Opciones de route:</p>");
            terminalMessage("<p>Sintaxis: ip route [add|del] [destination] [netmask] via [interface] [nexthop]</p>");
            terminalMessage("<p>route: configurar las reglas de enrutamiento</p>");
            terminalMessage("<p>add: añadir una regla de enrutamiento. Debe ir seguida de una dirección y una máscara de red.</p>");
            terminalMessage("<p>del: eliminar una regla de enrutamiento. Debe ir seguida de una dirección y una máscara de red.</p>");
            terminalMessage("<p>via: especificar la interfaz por la que se va a saltar y el siguiente salto</p>");
            terminalMessage("<p>Ejemplo: ip route add 192.168.1.0 255.255.255.0 via enp0s3 172.16.0.2</p>");
            terminalMessage("<p><span style='color: red'>Nota</span>: La utilidad ip route solo puede ser ejecutada desde un router.</p>");
            break;
        case "dig":
            terminalMessage("<p>dig: utilidad de resolución de nombres de dominio</p>");
            terminalMessage("<p>Sintaxis: dig [@server] &lt;domain&gt;</p>");
            terminalMessage("<p>Ejemplo: dig @8.8.8.8 google.com</p>");
            terminalMessage("<p><span style='color: red'>Nota</span>: Si no se especifica un servidor, se usará el servidor configurado en el equipo.</p>");
            break;
        case "dns":
            terminalMessage("<p>dns: utilidad de configuración de DNS (solo en servidores DNS) </p>");
            terminalMessage("<p>Sintaxis: dns &lt;add|del&gt; [-t &lt;type&gt;] &lt;domain|cname&gt; [ip|domain]</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p>add: añadir un registro</p>");
            terminalMessage("<p>del: eliminar un registro</p>");
            terminalMessage("<p>-s: mostrar la tabla de registros</p>");
            terminalMessage("<p>-t &lt;type&gt; : especificar el tipo de registro (A, CNAME, NS). Por defecto es A.</p>");
            terminalMessage("<p>Ejemplo: dns add google.com 192.168.1.1</p>");
            terminalMessage("<p>Ejemplo: dns del google.com</p>");
            terminalMessage("<p>Ejemplo: dns add -t CNAME google.com www.google.com</p>");
            break;
        case "arp":
            terminalMessage("<p>arp: utilidad para mostrar/administrar la tabla de direcciones MAC-IP</p>");
            terminalMessage("<p>Opciones:</p>");
            terminalMessage("<p>-n: mostrar la tabla de direcciones MAC-IP</p>");
            terminalMessage("<p>Ejemplo: arp -n</p>");
            break;
        case "help":
            terminalMessage("<p>help: utilidad para mostrar la ayuda del terminal</p>");
            break;
        case "exit":
            terminalMessage("exit: salir del terminal");
            break;
        default:
            terminalMessage("Error: No hay entrada en el manual para esta utilidad.");
            break;
    }
}
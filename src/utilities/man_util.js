function command_man(networkObjectId, topic) {

    const topicsMapper = {
        "man": () => manual_man(),
        "ip": () => manual_ip(),
        "nano": () => manual_nano(),
        "apt": () => manual_apt(),
        "arp": () => manual_arp(),
        "dig": () => manual_dig(),
        "dns": () => manual_dns(),
        "mkdir": () => manual_mkdir(),
        "touch": () => manual_touch(),
        "ls": () => manual_ls(),
        "rm": () => manual_rm(),
        "cd": () => manual_cd(),
        "cat": () => manual_cat(),
        "ifup": () => manual_ifup(),
        "ifdown": () => manual_ifdown(),
        "iptables": () => manual_Iptables(),
        "ping": () => manual_ping(),
        "systemctl": () => manual_systemctl(),
        "traceroute": () => manual_traceroute()
    }

    topicsMapper[topic] ? terminalMessage(topicsMapper[topic](), networkObjectId) : terminalMessage(`Error: comando ${topic} desconocido.`, networkObjectId);

}

function manual_ip(){
    let message = '';
    message += 'NOMBRE\n';
    message += '    ip - Utilidad para configurar direcciones IP y rutas en objetos de red simulados\n';
    message += '\n';
    message += 'SINOPSIS\n';
    message += '    ip [ addr | route ] [ add | flush | del ] [ip/prefijo] [dev interfaz] [via ip]\n';
    message += '\n';
    message += 'DESCRIPCIÓN\n';
    message += '    La utilidad ip permite configurar direcciones IP o reglas de enrutamiento en objetos\n';
    message += '    de red simulados. Las operaciones se dividen en dos categorías principales:\n';
    message += '    addr    Gestiona las direcciones IP de las interfaces\n';
    message += '    route   Gestiona las rutas de enrutamiento IP\n';
    message += '\n';
    message += 'SUBCOMANDOS\n';
    message += '    addr\n';
    message += '        add [ip/prefijo] dev [interfaz]\n';
    message += '            Asigna una dirección IP a una interfaz específica.\n';
    message += '        flush dev [interfaz]\n';
    message += '            Elimina cualquier dirección IP asignada a la interfaz.\n';
    message += '\n';
    message += '    route\n';
    message += '        add [ip/prefijo|default] via [ip] dev [interfaz]\n';
    message += '            Añade una nueva ruta a una red o hacia la ruta por defecto.\n';
    message += '        del [ip/prefijo]\n';
    message += '            Elimina una ruta previamente añadida.\n';
    message += '\n';
    message += 'ARGUMENTOS\n';
    message += '    ip/prefijo\n';
    message += '        Dirección IP y longitud del prefijo CIDR (ej. 192.168.1.0/24).\n';
    message += '    default\n';
    message += '        Palabra clave para especificar la ruta por defecto (equivalente a 0.0.0.0/0).\n';
    message += '    interfaz\n';
    message += '        Nombre de la interfaz en el objeto de red (ej. enp0s3).\n';
    message += '    ip\n';
    message += '        Dirección IP válida utilizada como siguiente salto (gateway).\n';
    message += '\n';
    message += 'EJEMPLOS\n';
    message += '    ip addr add 192.168.1.1/24 dev enp0s3\n';
    message += '        Asigna la IP 192.168.1.1/24 a la interfaz enp0s3.\n';
    message += '    ip addr flush dev enp0s3\n';
    message += '        Elimina cualquier IP asignada a enp0s3.\n';
    message += '    ip route add 10.0.0.0/8 via 192.168.1.254 dev enp0s3\n';
    message += '        Añade una ruta para llegar a 10.0.0.0/8 a través del gateway 192.168.1.254 por enp0s3.\n';
    message += '    ip route del 10.0.0.0/8\n';
    message += '        Elimina la ruta para 10.0.0.0/8.\n';
    message += '\n';
    message += 'NOTAS\n';
    message += '    Si se omite el subcomando (add, flush, del), se mostrará la configuración actual.\n';
    message += '\n';
    message += 'ERRORES COMUNES\n';
    message += '    - Usar simultáneamente add y flush/del\n';
    message += '    - Interfaces no reconocidas\n';
    message += '    - Formato CIDR inválido en direcciones\n';
    message += '\n';
    message += 'AUTOR\n';
    message += '    Simulador de redes desarrollado por Amin Pérez (2025).\n';
    return message;
}

function manual_nano(){
    let message = '';
    message += 'NOMBRE\n';
    message += '    nano - Editor de texto para visualizar y modificar archivos en objetos de red simulados\n';
    message += '\n';
    message += 'SINOPSIS\n';
    message += '    nano [archivo]\n';
    message += '\n';
    message += 'DESCRIPCIÓN\n';
    message += '    Abre un archivo en el editor visual del simulador de red, permitiendo al usuario ver\n';
    message += '    y modificar su contenido. El archivo debe estar dentro del sistema de archivos del objeto.\n';
    message += '\n';
    message += 'ARGUMENTOS\n';
    message += '    archivo\n';
    message += '        Ruta relativa o absoluta del archivo que se desea abrir (ej. /etc/config.txt).\n';
    message += '\n';
    message += 'AUTOR\n';
    message += '    Simulador de redes desarrollado por Amin Pérez (2025).\n';

    return message;
}

function manual_apt() {
    let message = '';
    message += 'NOMBRE\n';
    message += '    apt - Herramienta para la gestión de paquetes en sistemas simulados\n';
    message += '\n';
    message += 'SINOPSIS\n';
    message += '    apt [install|remove] <nombre-del-paquete>\n';
    message += '\n';
    message += 'DESCRIPCIÓN\n';
    message += '    El comando apt permite instalar o eliminar paquetes dentro del sistema.\n';
    message += '    Utiliza dpkg como gestor de bajo nivel para completar las operaciones.\n';
    message += '\n';
    message += 'SUBCOMANDOS\n';
    message += '    install <paquete>\n';
    message += '        Instala el paquete indicado y sus servicios asociados.\n';
    message += '\n';
    message += '    remove <paquete>\n';
    message += '        Elimina el paquete indicado y sus servicios asociados.\n';
    message += '\n';
    message += 'ARGUMENTOS\n';
    message += '    <paquete>\n';
    message += '        Nombre del paquete que se desea instalar o eliminar. Paquetes disponibles:\n';
    message += '            apache2, bind9, isc-dhcp-server, isc-dhcp-relay, isc-dhcp-client\n';
    message += '\n';
    message += 'FUNCIONAMIENTO\n';
    message += '    - Verifica que el subcomando sea válido (install o remove).\n';
    message += '    - Muestra mensajes informativos al usuario.\n';
    message += '    - Ejecuta dpkg para realizar la instalación o eliminación del paquete.\n';
    message += '\n';
    message += 'EJEMPLOS\n';
    message += '    apt install apache2\n';
    message += '        Instala el paquete apache2.\n';
    message += '    apt remove bind9\n';
    message += '        Elimina el paquete bind9.\n';
    message += '\n';
    message += 'RELACIÓN DE PAQUETES Y SERVICIOS\n';
    message += '    apache2           -> apache\n';
    message += '    bind9             -> named\n';
    message += '    isc-dhcp-server   -> dhcpd\n';
    message += '    isc-dhcp-relay    -> dhcrelay\n';
    message += '    isc-dhcp-client   -> dhclient\n';
    message += '\n';
    message += 'AUTOR\n';
    message += '    Simulador de redes desarrollado por Amin Pérez (2025).\n';


    return message;
}

function manual_arp() {
    let message = '';
    message += 'NOMBRE\n';
    message += '    arp - Muestra o gestiona la tabla ARP del sistema\n';
    message += '\n';
    message += 'SINOPSIS\n';
    message += '    arp -a\n';
    message += '    arp -f | --flush\n';
    message += '\n';
    message += 'DESCRIPCIÓN\n';
    message += '    El comando arp permite visualizar o vaciar la tabla ARP del sistema.\n';
    message += '\n';
    message += 'OPCIONES\n';
    message += '    -a\n';
    message += '        Muestra el contenido actual de la tabla ARP.\n';
    message += '\n';
    message += '    -f, --flush\n';
    message += '        Limpia la tabla ARP, eliminando todas las entradas almacenadas.\n';
    message += '\n';
    message += 'EJEMPLOS\n';
    message += '    arp -a\n';
    message += '        Muestra todas las entradas ARP actuales.\n';
    message += '\n';
    message += '    arp -f\n';
    message += '        Elimina todas las entradas ARP.\n';
    message += '\n';
    message += '    arp --flush\n';
    message += '        Elimina todas las entradas ARP (forma extendida).\n';
    message += '\n';
    message += 'AUTOR\n';
    message += '    Simulador de redes desarrollado por Amin Pérez (2025).\n';
    return message;
}

function manual_dig() {
    let message = '';
    message += 'NOMBRE\n';
    message += '    dig - Realiza consultas DNS sobre nombres de dominio o direcciones IP\n';
    message += '\n';
    message += 'SINOPSIS\n';
    message += '    dig [opciones] <dominio|ip>\n';
    message += '\n';
    message += 'DESCRIPCIÓN\n';
    message += '    Este comando permite consultar registros DNS específicos, como A, AAAA, NS, MX, SOA o PTR.\n';
    message += '    Puede utilizarse para realizar consultas directas o inversas, y especificar un servidor DNS concreto.\n';
    message += '\n';
    message += 'OPCIONES\n';
    message += '    -x\n';
    message += '        Realiza una consulta inversa (PTR) sobre una dirección IP.\n';
    message += '\n';
    message += '    -t <tipo>\n';
    message += '        Especifica el tipo de registro DNS a consultar. Valores válidos: A, NS, SOA, PTR.\n';
    message += '\n';
    message += '    @ <ip>\n';
    message += '        Especifica la dirección IP del servidor DNS que se usará para la consulta.\n';
    message += '\n';
    message += 'EJEMPLOS\n';
    message += '    dig google.com\n';
    message += '        Consulta el registro A del dominio google.com usando el servidor DNS por defecto.\n';
    message += '\n';
    message += '    dig -t SOA gmail.com\n';
    message += '        Consulta el registro SOA del dominio gmail.com.\n';
    message += '\n';
    message += '    dig -x 8.8.8.8\n';
    message += '        Realiza una consulta inversa para la IP 8.8.8.8.\n';
    message += '\n';
    message += '    dig @ 192.168.1.1 ejemplo.org\n';
    message += '        Consulta el registro A de ejemplo.org usando el servidor DNS 192.168.1.1.\n';
    message += '\n';
    message += 'ERRORES COMUNES\n';
    message += '    - Al contrario que en Linux, la opción @ no debe ir pegada al servidor DNS (@8.8.8.8 no es válido)\n';
    message += '    - Especificar un tipo de registro inválido\n';
    message += '    - Especificar una ip inválida\n';
    message += '    - Especificar un servidor DNS inválido\n';
    message += '\n';
    message += 'NOTAS\n';
    message += '    - Los nombres de dominio pueden opcionalmente terminar en un punto (.)\n';
    message += '\n';
    message += 'AUTOR\n';
    message += '    Simulador de redes desarrollado por Amin Pérez (2025).\n';
    return message;
}

function manual_dns() {
    let message = '';
    message += 'NOMBRE\n';
    message += '    dns - Gestiona registros DNS en el servidor actual\n';
    message += '\n';
    message += 'SINOPSIS\n';
    message += '    dns <add|del> [-t <tipo>] <dominio> <valor>\n';
    message += '    dns -s | --show\n';
    message += '    dns -f | --flush\n';
    message += '\n';
    message += 'DESCRIPCIÓN\n';
    message += '    Permite visualizar, añadir, eliminar y limpiar registros DNS del sistema.\n';
    message += '    Solo está disponible si el servicio DNS (named) está activo.\n';
    message += '\n';
    message += 'OPCIONES\n';
    message += '    -s, --show\n';
    message += '        Muestra la tabla de registros DNS actual.\n';
    message += '\n';
    message += '    -f, --flush\n';
    message += '        Elimina todos los registros de la tabla DNS.\n';
    message += '\n';
    message += '    add [-t <tipo>] <dominio> <valor>\n';
    message += '        Añade un registro DNS. Si no se indica tipo, se asume A.\n';
    message += '        Tipos soportados: A, SOA, NS, CNAME, PTR\n';
    message += '\n';
    message += '    del <tipo> <dominio>\n';
    message += '        Elimina un registro DNS específico.\n';
    message += '\n';
    message += 'EJEMPLOS\n';
    message += '    dns add ejemplo.com 192.168.1.1\n';
    message += '        Añade un registro A para ejemplo.com apuntando a 192.168.1.1.\n';
    message += '\n';
    message += '    dns add -t CNAME www ejemplo.com\n';
    message += '        Añade un registro CNAME para www apuntando a ejemplo.com.\n';
    message += '\n';
    message += '    dns del A ejemplo.com\n';
    message += '        Elimina el registro A asociado a ejemplo.com.\n';
    message += '\n';
    message += '    dns -s\n';
    message += '        Muestra la tabla actual de registros DNS.\n';
    message += '\n';
    message += '    dns -f\n';
    message += '        Borra todos los registros de la tabla DNS.\n';
    message += '\n';
    message += 'AUTOR\n';
    message += '    Simulador de redes desarrollado por Amin Pérez (2025).\n';
    return message;
}

function manual_mkdir() {
    let message = "";
    message += "NOMBRE\n";
    message += "    mkdir - crea un nuevo directorio en el sistema de archivos\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    mkdir <ruta>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Crea un nuevo directorio en la ruta especificada.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    mkdir /etc/config\n";
    message += "        Crea el directorio 'config' dentro de '/etc'.\n";
    return message;
}

function manual_touch() {
    let message = "";
    message += "NOMBRE\n";
    message += "    touch - crea un archivo vacío en la ruta especificada\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    touch <ruta>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Crea un archivo vacío en la ruta proporcionada. Si el archivo ya existe, no lo modifica.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    touch /home/user/info.txt\n";
    message += "        Crea un archivo 'info.txt' en el directorio '/home/user'.\n";
    return message;
}

function manual_ls() {
    let message = "";
    message += "NOMBRE\n";
    message += "    ls - muestra el contenido de un directorio\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    ls [<ruta>]\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Lista los archivos y carpetas contenidos en el directorio especificado.\n";
    message += "    Si no se proporciona una ruta, se usa el directorio actual.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    ls /etc\n";
    message += "        Muestra los archivos y carpetas en el directorio '/etc'.\n";
    return message;
}

function manual_rm() {
    let message = "";
    message += "NOMBRE\n";
    message += "    rm - elimina un archivo o directorio\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    rm <ruta>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Elimina el archivo o carpeta especificado. Si el elemento no existe, muestra un error.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    rm /home/user/info.txt\n";
    message += "        Elimina el archivo 'info.txt'.\n";
    return message;
}

function manual_cd() {
    let message = "";
    message += "NOMBRE\n";
    message += "    cd - cambia el directorio de trabajo actual\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    cd <ruta>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Cambia el directorio actual al especificado por la ruta.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    cd /var/log\n";
    message += "        Cambia al directorio '/var/log'.\n";
    return message;
}

function manual_cat() {
    let message = "";
    message += "NOMBRE\n";
    message += "    cat - muestra el contenido de un archivo\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    cat <archivo>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Muestra el contenido completo de un archivo en la terminal.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    cat /etc/hosts\n";
    message += "        Muestra el contenido del archivo 'hosts'.\n";
    return message;
}

function manual_ifup() {
    let message = "";
    message += "NOMBRE\n";
    message += "    ifup - configura una interfaz de red usando el archivo '/etc/network/interfaces'\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    ifup <interfaz>\n";
    message += "    ifup -a\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Configura una interfaz de red aplicando los parámetros definidos en el archivo '/etc/network/interfaces'.\n";
    message += "    La opción -a configura todas las interfaces definidas en ese archivo.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    ifup eth0\n";
    message += "        Configura la interfaz 'eth0'.\n";
    message += "\n";
    message += "    ifup -a\n";
    message += "        Configura todas las interfaces definidas en '/etc/network/interfaces'.\n";
    return message;
}

function manual_ifdown() {
    let message = "";
    message += "NOMBRE\n";
    message += "    ifdown - desconfigura una interfaz de red\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    ifdown <interfaz>\n";
    message += "    ifdown -a\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Desactiva una interfaz de red y elimina las reglas de enrutamiento asociadas.\n";
    message += "    La opción -a desactiva todas las interfaces del sistema.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    ifdown eth1\n";
    message += "        Desactiva la interfaz 'eth1'.\n";
    message += "\n";
    message += "    ifdown -a\n";
    message += "        Desactiva todas las interfaces de red disponibles.\n";
    return message;
}

function manual_Iptables() {
    let message = "";
    message += "NOMBRE\n";
    message += "    iptables - administrar las reglas de firewall en un sistema\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    iptables -S\n";
    message += "    iptables -P <cadena> <politica>\n";
    message += "    iptables -F <cadena>\n";
    message += "    iptables -D <número de regla>\n";
    message += "    iptables -t <tabla> -A <cadena> <opciones>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    Administra las reglas del firewall en el sistema mediante iptables.\n";
    message += "    Las reglas se aplican a los paquetes que pasan por el sistema y se pueden\n";
    message += "    configurar para permitir o bloquear el tráfico según distintos criterios.\n";
    message += "\n";
    message += "OPCIONES\n";
    message += "    -S\n";
    message += "        Muestra las políticas predeterminadas y las reglas de la tabla del firewall.\n";
    message += "    -P <cadena> <politica>\n";
    message += "        Establece la política predeterminada para una cadena especificada.\n";
    message += "    -F <cadena>\n";
    message += "        Elimina todas las reglas de la cadena especificada.\n";
    message += "    -D <número de regla>\n";
    message += "        Elimina la regla indicada por el número de regla.\n";
    message += "    -t <tabla>\n";
    message += "        Especifica la tabla a usar (por ejemplo, 'filter', 'nat').\n";
    message += "    -A <cadena> <opciones>\n";
    message += "        Añade una nueva regla a una cadena especificada.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    iptables -S\n";
    message += "        Muestra las políticas y reglas actuales del firewall.\n";
    message += "\n";
    message += "    iptables -P INPUT DROP\n";
    message += "        Establece la política predeterminada de la cadena 'INPUT' a 'DROP'.\n";
    message += "\n";
    message += "    iptables -F INPUT\n";
    message += "        Elimina todas las reglas de la cadena 'INPUT'.\n";
    message += "\n";
    message += "    iptables -t nat -A POSTROUTING -o enp0s3 -j SNAT --to-source 192.168.1.254\n";
    message += "        Añade una regla de redirección de salida a una interfaz especificada.\n";
    return message;
}

function manual_ping() {
    let message = "";
    message += "NOMBRE\n";
    message += "    ping - verificar la conectividad con otra máquina a través de la red\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    ping <ip | dominio>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    El comando ping se utiliza para verificar la conectividad de red entre el sistema\n";
    message += "    y otro host, ya sea una dirección IP o un dominio. Envia paquetes ICMP Echo Request\n";
    message += "    al destino y espera respuestas (Echo Reply), mostrando el tiempo que tarda en recibir\n";
    message += "    la respuesta.\n";
    message += "\n";
    message += "    Si el destino está disponible, se recibirá una respuesta con el tiempo de ida y vuelta\n";
    message += "    de los paquetes. Si no se puede establecer una conexión, se mostrará un mensaje de error.\n";
    message += "\n";
    message += "OPCIONES\n";
    message += "    <ip | dominio>\n";
    message += "        Dirección IP o dominio del host al que se desea hacer el ping.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    ping 8.8.8.8\n";
    message += "        Realiza un ping a la dirección IP 8.8.8.8 (servidor DNS de Google).\n";
    message += "\n";
    message += "    ping www.google.com\n";
    message += "        Realiza un ping al dominio www.google.com.\n";
    message += "\n";
    message += "SALIDAS\n";
    message += "    Si el ping es exitoso, muestra el tiempo de ida y vuelta del paquete:\n";
    message += "        PING www.google.com (216.58.214.14) 56(84) bytes de datos.\n";
    message += "        64 bytes desde 216.58.214.14: icmp_seq=1 ttl=53 time=10.2 ms\n";
    message += "\n";
    message += "    Si el nombre de dominio no se resuelve:\n";
    message += "        ping: www.google.com: Nombre o servicio desconocido.\n";
    message += "\n";
    message += "    Si la IP no es válida:\n";
    message += "        ping: 999.999.999.999: La dirección IP no es válida.\n";
    message += "\n";
    message += "    Si la red es inaccesible:\n";
    message += "        ping: connect: La red es inaccesible.\n";

    return message;
}

function manual_systemctl() {
    let message = "";
    message += "NOMBRE\n";
    message += "    systemctl - gestionar servicios en el sistema\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    systemctl [start|restart|stop|status] <nombre del servicio>\n";
    message += "    systemctl list-units\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    El comando systemctl permite gestionar los servicios del sistema, permitiendo\n";
    message += "    iniciar, detener, reiniciar y verificar el estado de los servicios. También permite\n";
    message += "    listar todas las unidades del sistema.\n";
    message += "\n";
    message += "OPCIONES\n";
    message += "    start\n";
    message += "        Inicia el servicio especificado.\n";
    message += "\n";
    message += "    restart\n";
    message += "        Reinicia el servicio especificado.\n";
    message += "\n";
    message += "    stop\n";
    message += "        Detiene el servicio especificado.\n";
    message += "\n";
    message += "    status\n";
    message += "        Muestra el estado del servicio especificado.\n";
    message += "\n";
    message += "    list-units\n";
    message += "        Muestra una lista de todos los servicios y unidades disponibles en el sistema.\n";
    message += "\n";
    message += "SERVICIOS\n";
    message += "    dhcpd\n";
    message += "        Servicio de servidor DHCP.\n";
    message += "\n";
    message += "    apache\n";
    message += "        Servicio del servidor web Apache.\n";
    message += "\n";
    message += "    dhclient\n";
    message += "        Cliente DHCP.\n";
    message += "\n";
    message += "    dhcrelay\n";
    message += "        Servicio de retransmisión DHCP.\n";
    message += "\n";
    message += "    resolved\n";
    message += "        Servicio de resolución de DNS.\n";
    message += "\n";
    message += "    named\n";
    message += "        Servicio de servidor DNS (BIND).\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    systemctl start apache\n";
    message += "        Inicia el servicio Apache.\n";
    message += "\n";
    message += "    systemctl stop dhcpd\n";
    message += "        Detiene el servicio DHCP.\n";
    message += "\n";
    message += "    systemctl status resolved\n";
    message += "        Muestra el estado del servicio de resolución de DNS.\n";
    message += "\n";
    message += "    systemctl list-units\n";
    message += "        Muestra una lista de todos los servicios activos en el sistema.\n";

    return message;
}

function manual_traceroute() {
    let message = "";
    message += "NOMBRE\n";
    message += "    traceroute - traza el camino de los paquetes a un destino.\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    traceroute [-n] <destino>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    El comando traceroute muestra el camino que siguen los paquetes para llegar\n";
    message += "    al destino especificado, mostrando las direcciones IP de los routers por los\n";
    message += "    que pasan los paquetes, así como el tiempo que tardan en llegar a cada uno.\n";
    message += "\n";
    message += "OPCIONES\n";
    message += "    -n\n";
    message += "        Si se especifica, se evita la resolución de nombres de dominio y se\n";
    message += "        muestra únicamente las direcciones IP numéricas.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    traceroute www.ejemplo.com\n";
    message += "        Traza el camino hacia el dominio www.ejemplo.com, mostrando las direcciones\n";
    message += "        IP de cada salto.\n";
    message += "\n";
    message += "    traceroute -n 8.8.8.8\n";
    message += "        Traza el camino hacia la dirección IP 8.8.8.8, mostrando solo las direcciones\n";
    message += "        IP numéricas sin intentar resolver nombres de dominio.\n";

    return message;
}

function manual_man() {
    let message = "";
    message += "NOMBRE\n";
    message += "    man - Muestra los manuales de los comandos del sistema.\n";
    message += "\n";
    message += "SINOPSIS\n";
    message += "    man <comando>\n";
    message += "\n";
    message += "DESCRIPCIÓN\n";
    message += "    El comando man muestra el manual de los comandos disponibles en el sistema.\n";
    message += "    Proporciona una breve descripción de cada comando y su sintaxis, incluyendo\n";
    message += "    las opciones y ejemplos de uso.\n";
    message += "\n";
    message += "COMANDOS DISPONIBLES\n";
    message += "    ip          - Configuración y gestión de direcciones IP.\n";
    message += "    nano        - Editor de texto de terminal.\n";
    message += "    apt         - Herramienta de gestión de paquetes en sistemas basados en Debian.\n";
    message += "    arp         - Manipulación de la tabla ARP.\n";
    message += "    dig         - Herramienta para consultas DNS.\n";
    message += "    dns         - Configuración y gestión de registros DNS.\n";
    message += "    mkdir       - Crea un nuevo directorio.\n";
    message += "    touch       - Crea un nuevo archivo vacío.\n";
    message += "    ls          - Lista el contenido de un directorio.\n";
    message += "    rm          - Elimina archivos o directorios.\n";
    message += "    cd          - Cambia el directorio de trabajo.\n";
    message += "    cat         - Muestra el contenido de un archivo.\n";
    message += "    ifup        - Configura interfaces de red a partir del archivo de configuración.\n";
    message += "    ifdown      - Desconfigura interfaces de red.\n";
    message += "    iptables    - Configuración y gestión de reglas de firewall.\n";
    message += "    ping        - Realiza un test de conectividad a una IP o dominio.\n";
    message += "    systemctl   - Gestión de servicios del sistema.\n";
    message += "    traceroute  - Muestra la ruta de los paquetes hacia un destino.\n";
    message += "\n";
    message += "EJEMPLOS\n";
    message += "    man ip        - Muestra el manual para el comando 'ip'.\n";
    message += "    man nano      - Muestra el manual para el comando 'nano'.\n";
    message += "    man traceroute - Muestra el manual para el comando 'traceroute'.\n";

    return message;
}

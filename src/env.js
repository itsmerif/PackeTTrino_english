//variables globales
let itemIndex = 0;
let quickInfoTimeout;
const leaseTimers = {};

//opciones globales
let ignoreArpTraffic = false;

//variables de animaciones
let visualToggle = false;
let visualSpeed = 300;

//variables generales de hosts
let buffer = {}; //buffer general de paquetes para cada objeto de red
let browserBuffer = {}; //buffer de paquetes http

//variables de arp
let arpFlag = false;
let icmpFlag = false;

//variables de dhcp
let dhcpDiscoverFlag = false;
let dhcpRequestFlag = false;
let dhcpRenewFlag = false;
let dnsRequestFlag = false;

//variables de tcp
let tcpBuffer = {}; //buffer de numeros de secuencia TCP
let tcpSyncFlag = false;
let order = 0;

//variables de traceroute
let trace =  false; //se activa el modo traceroute
let traceReturn = false; //retorno del icmp con time exceeded
let traceBuffer = []; //buffer de saltos
let traceFlag = false; //bandera de traceroute

//variables de enrutamiento automático
let nodes = {};
let nodesNetmask = {};
let nodesIp = {};
let defaultNetwork = "0.0.0.0";
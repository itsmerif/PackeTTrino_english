//variables de control global
let itemIndex = 0;
let darkMode = false;
let visualToggle = false;
let visualSpeed = 300;
let paused = false;
let terminalBuffer = [];
let currentCommandIndex = 0;
let ignoreArpTraffic = false;
let pcs = {};
let routers = {};
let switches = {};
let servers = {};
let $ARPENTRYTTL = 120;

//variables de la terminal
let $PWD = [];

//flags de control de paquetes
let arpFlag = {};
let icmpFlag = {};
let dhcpDiscoverFlag = {};
let dhcpRequestFlag = {};
let dnsRequestFlag = {};
let tcpSyncFlag = {};
let traceFlag = {};
let quickPingToggle = false;
let quickPingObject =  "";

//control de la traza de paquetes
let trace = {}; 
let traceReturn = {};

//procedimiento de enrutamiento automático
let nodes = {};
let nodesNetmask = {};
let nodesIp = {};
let defaultNetwork = "";

//buffers
let buffer = {};
let httpBuffer = {};
let dhcpOfferBuffer = {};
let tcpBuffer = {};
let traceBuffer = {};
let trafficBuffer = [];
let routerChangesBuffer = {}; //este buffer guarda informacion por INTERFAZ, NO POR DISPOSITIVO

//variables de procesos en segundo plano

let serverLeaseTimers = {};
let clientLeaseTimers = {};
let arpEntryTimers = {};
let dnsCacheTimers = {};

//variables de gestion de SNAT Y DNAT

let connTrack = {};
//variables de control global
let itemIndex = 0;
let visualToggle = false;
let visualSpeed = 300;
let terminalBuffer = [];
let currentCommandIndex = 0;
let ignoreArpTraffic = false;
let $PWD = [];

//flags de control de paquetes
let arpFlag = {};
let icmpFlag = {};
let dhcpDiscoverFlag = {};
let dhcpRequestFlag = {};
let dnsRequestFlag = {};
let tcpSyncFlag = {};
let traceFlag = {};
let icmpTryoutToggle = false;
let icmpTryoutObject =  "";

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
let browserBuffer = {};
let dhcpOfferBuffer = {};
let tcpBuffer = {};
let traceBuffer = {};
let routerChangesBuffer = {}; //este buffer guarda informacion por INTERFAZ, NO POR DISPOSITIVO

//variables de procesos en segundo plano
let serverLeaseTimers = {};
let clientLeaseTimers = {};
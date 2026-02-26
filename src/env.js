//global control variables
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
let $MACENTRYTTL = 120;

//terminal variables
let $PWD = [];

//package control flags
let arpFlag = {};
let icmpFlag = {};
let dhcpDiscoverFlag = {};
let dhcpRequestFlag = {};
let dnsRequestFlag = {};
let tcpSyncFlag = {};
let traceFlag = {};
let quickPingToggle = false;
let quickPingObject =  "";

//Packet trace control
let trace = {}; 
let traceReturn = {};

//Automatic routing procedure
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
let routerChangesBuffer = {}; //This buffer stores information per INTERFACE, NOT PER DEVICE

//Background process variables

let serverLeaseTimers = {};
let clientLeaseTimers = {};
let arpEntryTimers = {};
let macEntryTimers = {};
let dnsCacheTimers = {};

//SNAT and DNAT management variables

let connTrack = {};

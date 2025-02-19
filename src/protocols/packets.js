class packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
    }
}

class ArpRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac) {
        super(origin_ip, destination_ip, origin_mac, "ff:ff:ff:ff:ff:ff");;
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "request";
    }
}

class ArpReply extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "reply";
    }
}

class IcmpEchoRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "request";
    }
}

class IcmpEchoReply extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "reply";
    }
}

class dhcpDiscover extends packet {
    constructor(origin_mac) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "discover";
        this.port = "67";
        this.giaddr = "0.0.0.0";
        this.ciaddr = "0.0.0.0";
        this.chaddr = "";
    }   
}

class dhcpOffer extends packet {
    constructor(origin_ip, origin_mac, server_ip, offer_ip, destination_mac, gateway, netmask) {
        super(origin_ip, "255.255.255.255", origin_mac, destination_mac);
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "offer";
        this.port = "68";
        this.yiaddr = offer_ip;
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        this.giaddr = "0.0.0.0";
        //dhcp options
        this.gateway = gateway;
        this.netmask = netmask;
    }
}

class dhcpRequest extends packet {
    constructor(origin_mac, requested_ip, server_ip, client_mac, hostname) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "request";
        this.port = "67";
        this.yiaddr = requested_ip;
        this.siaddr = server_ip;
        this.ciaddr = client_mac;
        //dhcp options
        this.hostname = hostname;
    }
}

class dhcpAck extends packet {
    constructor(origin_mac, assigned_ip, client_mac, server_ip, gateway, netmask, hostname) {
        super(server_ip, "255.255.255.255", origin_mac, client_mac);
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "ack";
        this.port = "68";
        this.ciaddr = client_mac;
        this.yiaddr = assigned_ip;
        this.siaddr = server_ip;
        //dhcp options
        this.gateway = gateway;
        this.netmask = netmask;
        this.hostname = hostname;
    }
}
class packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
    }  
}

class ArpRequest extends packet{
    constructor(origin_ip, destination_ip, origin_mac) {
        super(origin_ip, destination_ip, origin_mac, "ff:ff:ff:ff:ff:ff");;
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "request";
    }
}

class ArpReply extends packet{
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
        super("0:0:0:0","255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "discover";
        this.port = "67";
    }
}
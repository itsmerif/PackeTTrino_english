class ArpRequest {
    constructor(origin_ip, destination_ip, origin_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = "ff:ff:ff:ff:ff:ff";
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "request";
    }
}

class ArpReply {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
        this.protocol = "arp";
        this.ttl = 64;
        this.type = "reply";
    }
}

class IcmpEchoRequest {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "request";
    }
}

class IcmpEchoReply {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "reply";
    }
}
class packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        this.origin_ip = origin_ip;
        this.destination_ip = destination_ip;
        this.origin_mac = origin_mac;
        this.destination_mac = destination_mac;
        this.xid = Math.floor(Math.random() * 10000);
    }
}

class ArpRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac) {
        super(origin_ip, destination_ip, origin_mac, "ff:ff:ff:ff:ff:ff");;
        this.protocol = "arp";
        this.type = "request";
    }
}

class ArpReply extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "arp";
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

class IcmpTimeExceeded extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.protocol = "icmp";
        this.ttl = 64;
        this.type = "time-exceeded";
    }
}

class dhcpDiscover extends packet {
    constructor(origin_mac) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "discover";
        this.sport = "68";
        this.dport = "67";
        this.giaddr = "0.0.0.0";
        this.ciaddr = "0.0.0.0";
        this.chaddr = origin_mac;
    }
}

class dhcpOffer extends packet {
    constructor(origin_ip, origin_mac, server_ip, offer_ip, destination_mac, chaddr, gateway, netmask, dns, leasetime) {
        super(origin_ip, "255.255.255.255", origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "offer";
        this.sport = "67";
        this.dport = "68";
        this.yiaddr = offer_ip;
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        this.giaddr = "0.0.0.0";
        this.chaddr = chaddr;
        // DHCP options
        this.gateway = gateway;
        this.netmask = netmask;
        this.dns = dns;
        this.leasetime = leasetime;
    }
}

class dhcpRequest extends packet {
    constructor(origin_mac, requested_ip, server_ip, hostname) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "request";
        this.sport = "68";
        this.dport = "67";
        this.yiaddr = "0.0.0.0";
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        this.chaddr = origin_mac;
        // DHCP options
        this.requested_ip = requested_ip;
        this.hostname = hostname;
        this.leasetime = "";
        this.gateway = "";
        this.netmask = "";
        this.dns = "";
    }
}

class dhcpAck extends packet {
    constructor(origin_mac, assigned_ip, server_ip, offergateway, offernetmask, offerdns, hostname, leasetime) {
        super(server_ip, "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "ack";
        this.sport = "67";
        this.dport = "68";
        this.ciaddr = "0.0.0.0";
        this.yiaddr = assigned_ip;
        this.siaddr = server_ip;
        this.chaddr = "";
        // DHCP options
        this.gateway = offergateway;
        this.netmask = offernetmask;
        this.dns = offerdns;
        this.hostname = hostname;
        this.leasetime = leasetime;
    }
}

class dhcpRelease extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "release";
        this.sport = "68";
        this.dport = "67";
        this.ciaddr = origin_ip;
        this.yiaddr = "";
        this.siaddr = destination_ip;
        this.giaddr = "";
        this.chaddr = origin_mac;
    }
}

class dnsRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, query) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dns";
        this.ttl = 64;
        this.type = "request";
        this.sport = "";
        this.dport = "53";
        this.query = query;
        this.answer_type = "";
        this.answer = "";
        this.authority = "";
        this.authority_domain = "";
    }
}

class dnsReply extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, query, answer) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dns";
        this.ttl = 64;
        this.type = "reply";
        this.sport = "53";
        this.dport = "";
        this.query = query;
        this.answer_type = "";
        this.answer = answer;
    }
}

class syn extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn";
        this.sport = sport;
        this.dport = dport;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
    }
}

class synAck extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn-ack";
        this.sport = sport;
        this.dport = dport;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
    }
}

class Ack extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn-ack-reply";
        this.sport = sport;
        this.dport = dport;
        this.sequence_number = "";
        this.ack_number = "";
    }
}

class httpRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport, method) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "http";
        this.ttl = 64;
        this.type = "request";
        this.sport = sport;
        this.dport = dport;
        this.method = method;
        this.keepalive = true;
    }
}

class httpReply extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, sport, dport) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "http";
        this.ttl = 64;
        this.sport = sport;
        this.dport = dport;
        this.type = "reply";
        this.header = "content-type: text/html";
        this.body = "";
        this.keepalive = true;
    }
}
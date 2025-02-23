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
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "discover";
        this.port = "67";
        this.giaddr = "0.0.0.0";
        this.ciaddr = "0.0.0.0";
        this.chaddr = origin_mac;
    }
}

class dhcpOffer extends packet {
    constructor(origin_ip, origin_mac, server_ip, offer_ip, destination_mac, chaddr, gateway, netmask) {
        super(origin_ip, "255.255.255.255", origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "offer";
        this.port = "68";
        this.yiaddr = offer_ip;
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        this.giaddr = "0.0.0.0";
        this.chaddr = chaddr;
        // DHCP options
        this.gateway = gateway;
        this.netmask = netmask;
    }
}

class dhcpRequest extends packet {
    constructor(origin_mac, requested_ip, server_ip, hostname) {
        super("0.0.0.0", "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "request";
        this.port = "67";
        this.yiaddr = "0.0.0.0";
        this.siaddr = server_ip;
        this.ciaddr = "0.0.0.0";
        // DHCP options
        this.requested_ip = requested_ip;
        this.hostname = hostname;
    }
}

class dhcpAck extends packet {
    constructor(origin_mac, assigned_ip, server_ip, gateway, netmask, hostname) {
        super(server_ip, "255.255.255.255", origin_mac, "ff:ff:ff:ff:ff:ff");
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "ack";
        this.port = "68";
        this.ciaddr = "0.0.0.0";
        this.yiaddr = assigned_ip;
        this.siaddr = server_ip;
        // DHCP options
        this.gateway = gateway;
        this.netmask = netmask;
        this.hostname = hostname;
    }
}

class dhcpRelease extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "release";
        this.port = "68";
        this.ciaddr = origin_ip;
        this.yiaddr = "";
        this.siaddr = destination_ip;
        this.giaddr = "";
        this.chaddr = origin_mac;
    }
}

class dhcpRenew extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, hostname) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dhcp";
        this.ttl = 64;
        this.type = "renew";
        this.port = "68";
        this.ciaddr = origin_ip;
        this.yiaddr = "";
        this.siaddr = destination_ip;
        this.giaddr = "";
        this.chaddr = origin_mac;
        this.hostname = hostname;
    }
}

class dnsRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, query) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dns";
        this.ttl = 64;
        this.type = "request";
        this.port = "53";
        this.query = query;
        this.answer_type = "";
        this.answer = "";
    }
}

class dnsReply extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, query, answer) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "udp";
        this.protocol = "dns";
        this.ttl = 64;
        this.type = "reply";
        this.port = "53";
        this.query = query;
        this.answer_type = "";
        this.answer = answer;
    }
}

class syn extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, port) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn";
        this.sport = 5000;
        this.dport = port;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
    }
}

class synAck extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, port) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn-ack";
        this.sport = port;
        this.dport = 5000;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
    }
}

class Ack extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, port) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "tcp";
        this.ttl = 64;
        this.type = "syn-ack-reply";
        this.sport = 5000;
        this.dport = port;
        this.sequence_number = "";
        this.ack_number = "";
    }
}

class httpRequest extends packet {
    constructor(origin_ip, destination_ip, origin_mac, destination_mac, port, method, path) {
        super(origin_ip, destination_ip, origin_mac, destination_mac);
        this.transport_protocol = "tcp";
        this.protocol = "http";
        this.ttl = 64;
        this.type = "request";
        this.sport = port;
        this.dport = 80;
        this.sequence_number = Math.floor(Math.random()*100000);
        this.ack_number = 0;
        this.method = method;
        this.path = path;
    }
}
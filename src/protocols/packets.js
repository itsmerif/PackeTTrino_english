function arpRequest(originIP, destinationIP, originMac) {
    return {
        layer3: {
            origin_ip: originIP,
            destination_ip: destinationIP,
        },
        layer2: {
            origin_mac: originMac,
            destination_mac: "ff:ff:ff:ff:ff:ff",
            protocol: "arp",
            type: "request"
        }
    };
}

function arpReply(originIP, destinationIP, originMac, destinationMac) {
    return {
        layer3: {
            origin_ip: originIP,
            destination_ip: destinationIP,
        },
        layer2: {
            origin_mac: originMac,
            destination_mac: destinationMac,
            protocol: "arp",
            type: "reply"
        }
    };
}

function icmpEchoRequest(originIP, destinationIP, originMac, destinationMac) {
    return {
        layer3: {
            origin_ip: originIP,
            destination_ip: destinationIP,
            protocol: "icmp",
            ttl: 64,
            type: "echo-request",
            code: 0
        },
        layer2: {
            origin_mac: originMac,
            destination_mac: destinationMac
        }
    };
}

function icmpEchoReply(originIP, destinationIP, originMac, destinationMac) {
    return {
        layer3: {
            origin_ip: originIP,
            destination_ip: destinationIP,
            protocol: "icmp",
            ttl: 64,
            type: "echo-reply",
            code: 0
        },
        layer2: {
            origin_mac: originMac,
            destination_mac: destinationMac
        }
    };
}
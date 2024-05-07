import struct
import socket


# convert ip to network address in kernel format
def ip_to_network_address(ip):
    return struct.unpack("I", socket.inet_aton(ip))[0]


# convert network address in kernel format to ip
def network_address_to_ip(ip):
    return socket.inet_ntop(socket.AF_INET, struct.pack("I", ip))

from bcc import BPF
import struct
import socket

bpf = BPF(src_file=b"xdp.c")


# convert ip to network address in kernel format
def ip_to_network_address(ip):
    return struct.unpack("I", socket.inet_aton(ip))[0]

# convert network address in kernel format to ip
def network_address_to_ip(ip):
    return socket.inet_ntop(socket.AF_INET, struct.pack("I", ip))


def receive_callback(ctx, data, size):
    event = bpf["pkt_buffer"].event(data)
    print(
        f"src ip: {network_address_to_ip(event.src_ip)}, dst ip: {network_address_to_ip(event.dst_ip)}")


def main():
    ifname = "lo"
    bpf.attach_xdp(dev=ifname, fn=bpf.load_func("extract_pkt_info", BPF.XDP))
    bpf["pkt_buffer"].open_ring_buffer(receive_callback)
    try:
        while True:
            bpf.ring_buffer_poll(30)  
    except KeyboardInterrupt:
        # detach the xdp
        bpf.remove_xdp(ifname)


if __name__ == '__main__':
    main()

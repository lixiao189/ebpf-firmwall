from bcc import BPF
from packet import Packet
from utils import network_address_to_ip

bpf = BPF(src_file=b"xdp.c")


def receive_callback(ctx, data, size):
    pkt = bpf["pkt_buffer"].event(data)

    # extract tcp flags
    fin_flag = not (pkt.flags & (1 << 7)) == 0
    syn_flag = not (pkt.flags & (1 << 6)) == 0
    rst_flag = not (pkt.flags & (1 << 5)) == 0
    psh_flag = not (pkt.flags & (1 << 4)) == 0
    ack_flag = not (pkt.flags & (1 << 3)) == 0
    urg_flag = not (pkt.flags & (1 << 2)) == 0

    packet = Packet(
        src=pkt.src_ip,
        dst=pkt.dst_ip,
        proto=pkt.protocol,
        sport=pkt.src_port,
        dport=pkt.dst_port,
        fin=fin_flag,
        syn=syn_flag,
        rst=rst_flag,
        psh=psh_flag,
        ack=ack_flag,
        urg=urg_flag,
        icmp_type=pkt.icmp_type,
        icmp_code=pkt.icmp_code
    )


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
